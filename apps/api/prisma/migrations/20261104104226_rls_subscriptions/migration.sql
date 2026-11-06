-- Row-Level Security for Subscription and Payment.
-- App must set `app.current_user_id` per-transaction for these to apply.
-- Owner role bypasses RLS — the API connects as owner, so RLS is defense-in-depth,
-- not the primary control. Enforcement lives in PrismaService.transactionForUser().

ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- Subscription: a subscriber sees/modifies only their own rows.
CREATE POLICY sub_select_own ON "Subscription"
  FOR SELECT
  USING ("subscriberId" = current_setting('app.current_user_id', true));

CREATE POLICY sub_insert_own ON "Subscription"
  FOR INSERT
  WITH CHECK ("subscriberId" = current_setting('app.current_user_id', true));

CREATE POLICY sub_update_own ON "Subscription"
  FOR UPDATE
  USING ("subscriberId" = current_setting('app.current_user_id', true))
  WITH CHECK ("subscriberId" = current_setting('app.current_user_id', true));

-- Payment: a payer sees/modifies only their own rows.
CREATE POLICY pay_select_own ON "Payment"
  FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY pay_insert_own ON "Payment"
  FOR INSERT
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY pay_update_own ON "Payment"
  FOR UPDATE
  USING ("userId" = current_setting('app.current_user_id', true))
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));
