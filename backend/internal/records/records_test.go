package records

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"testing"
)

// PUT then GET returns the record.
func TestPutThenList(t *testing.T) {
	srv, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "alice@example.com")

	resp := do(t, http.MethodPut, srv.URL+"/api/records/rec-1", dto("rec-1"), cookie)
	resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("put: got %d, want 204", resp.StatusCode)
	}

	got := do(t, http.MethodGet, srv.URL+"/api/records?kind=expense", nil, cookie)
	defer got.Body.Close()
	if got.StatusCode != http.StatusOK {
		t.Fatalf("list: got %d", got.StatusCode)
	}
	var body struct {
		Records []recordDTO `json:"records"`
	}
	if err := json.NewDecoder(got.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(body.Records) != 1 || body.Records[0].ID != "rec-1" {
		t.Errorf("expected 1 record rec-1, got %+v", body.Records)
	}
}

// PUT with the same id upserts (replaces ciphertext), not duplicates.
func TestPutUpsert(t *testing.T) {
	srv, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "alice@example.com")

	first := dto("rec-1")
	do(t, http.MethodPut, srv.URL+"/api/records/rec-1", first, cookie).Body.Close()
	updated := recordDTO{ID: "rec-1", Kind: KindExpense, Ciphertext: "dXBkYXRlZA=="}
	do(t, http.MethodPut, srv.URL+"/api/records/rec-1", updated, cookie).Body.Close()

	got := do(t, http.MethodGet, srv.URL+"/api/records?kind=expense", nil, cookie)
	defer got.Body.Close()
	var body struct {
		Records []recordDTO `json:"records"`
	}
	_ = json.NewDecoder(got.Body).Decode(&body)
	if len(body.Records) != 1 {
		t.Fatalf("upsert should keep 1 row, got %d", len(body.Records))
	}
	if body.Records[0].Ciphertext != "dXBkYXRlZA==" {
		t.Error("upsert did not replace ciphertext")
	}
}

// BR-HARD-3: re-uploading an id updates the kind column with the ciphertext.
func TestPutUpsertUpdatesKind(t *testing.T) {
	srv, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "alice@example.com")

	do(t, http.MethodPut, srv.URL+"/api/records/rec-1", dto("rec-1"), cookie).Body.Close()
	moved := recordDTO{ID: "rec-1", Kind: KindIncome, Ciphertext: "aW5jb21l"}
	do(t, http.MethodPut, srv.URL+"/api/records/rec-1", moved, cookie).Body.Close()

	old := do(t, http.MethodGet, srv.URL+"/api/records?kind=expense", nil, cookie)
	defer old.Body.Close()
	var expenses struct {
		Records []recordDTO `json:"records"`
	}
	_ = json.NewDecoder(old.Body).Decode(&expenses)
	if len(expenses.Records) != 0 {
		t.Errorf("record should have left kind=expense, got %d rows", len(expenses.Records))
	}
	movedList := do(t, http.MethodGet, srv.URL+"/api/records?kind=income", nil, cookie)
	defer movedList.Body.Close()
	var incomes struct {
		Records []recordDTO `json:"records"`
	}
	_ = json.NewDecoder(movedList.Body).Decode(&incomes)
	if len(incomes.Records) != 1 || incomes.Records[0].Ciphertext != "aW5jb21l" {
		t.Errorf("record should now list under kind=income, got %+v", incomes.Records)
	}
}

// BR-HARD-1: record uploads above 1 MiB are rejected with 413.
func TestPutTooLarge(t *testing.T) {
	srv, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "alice@example.com")

	big := recordDTO{
		ID:         "rec-big",
		Kind:       KindExpense,
		Ciphertext: base64.StdEncoding.EncodeToString(make([]byte, 1100*1024)),
	}
	resp := do(t, http.MethodPut, srv.URL+"/api/records/rec-big", big, cookie)
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusRequestEntityTooLarge {
		t.Errorf("oversize put: got %d, want 413", resp.StatusCode)
	}
}

// DELETE removes the record; subsequent list is empty.
func TestDelete(t *testing.T) {
	srv, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "alice@example.com")

	do(t, http.MethodPut, srv.URL+"/api/records/rec-1", dto("rec-1"), cookie).Body.Close()
	del := do(t, http.MethodDelete, srv.URL+"/api/records/rec-1", nil, cookie)
	del.Body.Close()
	if del.StatusCode != http.StatusNoContent {
		t.Fatalf("delete: got %d", del.StatusCode)
	}

	got := do(t, http.MethodGet, srv.URL+"/api/records?kind=expense", nil, cookie)
	defer got.Body.Close()
	var body struct {
		Records []recordDTO `json:"records"`
	}
	_ = json.NewDecoder(got.Body).Decode(&body)
	if len(body.Records) != 0 {
		t.Errorf("after delete expected 0 records, got %d", len(body.Records))
	}
}

// BR-CONF-1 isolation: a user cannot read or delete another user's records.
func TestPerUserIsolation(t *testing.T) {
	srv, sender := newTestServer(t)
	alice := signIn(t, srv, sender, "alice@example.com")
	bob := signIn(t, srv, sender, "bob@example.com")

	// Alice stores a record; Bob must not see it.
	do(t, http.MethodPut, srv.URL+"/api/records/a-secret", dto("a-secret"), alice).Body.Close()

	bobList := do(t, http.MethodGet, srv.URL+"/api/records?kind=expense", nil, bob)
	defer bobList.Body.Close()
	var body struct {
		Records []recordDTO `json:"records"`
	}
	_ = json.NewDecoder(bobList.Body).Decode(&body)
	if len(body.Records) != 0 {
		t.Error("Bob must not see Alice's records (isolation)")
	}

	// Bob cannot delete Alice's record either.
	do(t, http.MethodDelete, srv.URL+"/api/records/a-secret", nil, bob).Body.Close()
	aliceList := do(t, http.MethodGet, srv.URL+"/api/records?kind=expense", nil, alice)
	defer aliceList.Body.Close()
	var aliceBody struct {
		Records []recordDTO `json:"records"`
	}
	_ = json.NewDecoder(aliceList.Body).Decode(&aliceBody)
	if len(aliceBody.Records) != 1 {
		t.Error("Bob's delete must not affect Alice's record (isolation)")
	}
}

// Unauthenticated requests are refused 401.
func TestUnauthenticatedRefused(t *testing.T) {
	srv, _ := newTestServer(t)

	resp, err := http.Get(srv.URL + "/api/records?kind=expense")
	if err != nil {
		t.Fatalf("GET: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("GET no-auth: got %d, want 401", resp.StatusCode)
	}
}

// Invalid kind is rejected.
func TestInvalidKind(t *testing.T) {
	srv, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "alice@example.com")

	resp := do(t, http.MethodGet, srv.URL+"/api/records?kind=bogus", nil, cookie)
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("invalid kind: got %d, want 400", resp.StatusCode)
	}
}

// Income kind round-trips like any encrypted record (TICKET-020).
func TestIncomeKindRoundTrip(t *testing.T) {
	srv, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "alice@example.com")

	income := recordDTO{ID: "inc-1", Kind: KindIncome, Ciphertext: "aW5jb21l"}
	put := do(t, http.MethodPut, srv.URL+"/api/records/inc-1", income, cookie)
	put.Body.Close()
	if put.StatusCode != http.StatusNoContent {
		t.Fatalf("put income: got %d, want 204", put.StatusCode)
	}

	got := do(t, http.MethodGet, srv.URL+"/api/records?kind=income", nil, cookie)
	defer got.Body.Close()
	if got.StatusCode != http.StatusOK {
		t.Fatalf("list income: got %d, want 200", got.StatusCode)
	}
	var body struct {
		Records []recordDTO `json:"records"`
	}
	if err := json.NewDecoder(got.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(body.Records) != 1 || body.Records[0].ID != "inc-1" {
		t.Errorf("expected 1 income record inc-1, got %+v", body.Records)
	}
}

// Expectations kind round-trips like any encrypted record (WORK-005).
func TestExpectationsKindRoundTrip(t *testing.T) {
	srv, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "alice@example.com")

	plan := recordDTO{ID: "expectations", Kind: KindExpectation, Ciphertext: "cGxhbg=="}
	put := do(t, http.MethodPut, srv.URL+"/api/records/expectations", plan, cookie)
	put.Body.Close()
	if put.StatusCode != http.StatusNoContent {
		t.Fatalf("put expectations: got %d, want 204", put.StatusCode)
	}

	got := do(t, http.MethodGet, srv.URL+"/api/records?kind=expectations", nil, cookie)
	defer got.Body.Close()
	if got.StatusCode != http.StatusOK {
		t.Fatalf("list expectations: got %d", got.StatusCode)
	}
	var body struct {
		Records []recordDTO `json:"records"`
	}
	if err := json.NewDecoder(got.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(body.Records) != 1 || body.Records[0].ID != "expectations" {
		t.Errorf("expected 1 expectations record, got %+v", body.Records)
	}
}

// Income-event kind round-trips like any encrypted record (WORK-006, BR-IOFF-1).
func TestIncomeEventKindRoundTrip(t *testing.T) {
	srv, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "alice@example.com")

	event := recordDTO{ID: "evt-1", Kind: KindIncomeEvent, Ciphertext: "Ym9udXM="}
	put := do(t, http.MethodPut, srv.URL+"/api/records/evt-1", event, cookie)
	put.Body.Close()
	if put.StatusCode != http.StatusNoContent {
		t.Fatalf("put income_event: got %d, want 204", put.StatusCode)
	}

	got := do(t, http.MethodGet, srv.URL+"/api/records?kind=income_event", nil, cookie)
	defer got.Body.Close()
	if got.StatusCode != http.StatusOK {
		t.Fatalf("list income_event: got %d", got.StatusCode)
	}
	var body struct {
		Records []recordDTO `json:"records"`
	}
	if err := json.NewDecoder(got.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(body.Records) != 1 || body.Records[0].ID != "evt-1" {
		t.Errorf("expected 1 income_event record, got %+v", body.Records)
	}
}

// Settings kind round-trips like any encrypted record (WORK-007, BR-CUR-1).
func TestSettingsKindRoundTrip(t *testing.T) {
	srv, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "alice@example.com")

	dto := recordDTO{ID: "settings", Kind: KindSettings, Ciphertext: "Y3Vycw=="}
	put := do(t, http.MethodPut, srv.URL+"/api/records/settings", dto, cookie)
	put.Body.Close()
	if put.StatusCode != http.StatusNoContent {
		t.Fatalf("put settings: got %d, want 204", put.StatusCode)
	}

	got := do(t, http.MethodGet, srv.URL+"/api/records?kind=settings", nil, cookie)
	defer got.Body.Close()
	if got.StatusCode != http.StatusOK {
		t.Fatalf("list settings: got %d", got.StatusCode)
	}
	var body struct {
		Records []recordDTO `json:"records"`
	}
	if err := json.NewDecoder(got.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(body.Records) != 1 || body.Records[0].ID != "settings" {
		t.Errorf("expected 1 settings record, got %+v", body.Records)
	}
}
