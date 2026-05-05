# Database Rollback And Data Impact Inventory

Status: active Phase 6 rollback contract.

## Migration Inventory

| Migration                               | Data impact                      | Rollback/recovery note                                |
| --------------------------------------- | -------------------------------- | ----------------------------------------------------- |
| 001_extensions_enums                    | Additive                         | Restore from backup only if bootstrap failed.         |
| 002_contacts                            | Additive                         | Drop fresh tables only before production data exists. |
| 003_orders_inventory                    | Additive                         | Restore if inventory data was written incorrectly.    |
| 004_stock_operations                    | Additive                         | Forward repair preferred for stock history.           |
| 005_invoicing                           | Additive                         | Restore if invoice data was corrupted.                |
| 006_finance                             | Additive                         | Restore if payment/purchase data was corrupted.       |
| 007_views_functions_rls                 | Policy/view change               | Forward policy correction preferred.                  |
| 008_schema_fixes                        | Additive type widening           | No data-loss rollback needed.                         |
| 009_missing_indexes                     | Additive indexes                 | Drop indexes if needed.                               |
| 010_fix_profit_loss                     | Function/view change             | Forward function replacement.                         |
| 011_transactional_invoice               | RPC change                       | Keep versioned alias or forward repair.               |
| 012_transactional_payment               | RPC change                       | Keep versioned alias or forward repair.               |
| 013_fy_sequence_reset                   | Function change                  | Forward function replacement.                         |
| 014_audit_log                           | Additive audit table/triggers    | Disable trigger only with Security owner approval.    |
| 015_fix_audit_log_rls                   | Policy hardening                 | Forward policy replacement.                           |
| 015_low_stock_notification              | Additive trigger                 | Drop trigger if noisy.                                |
| 016_materialized_views                  | Additive derived views           | Refresh or recreate from source tables.               |
| 017_versioned_rpc_aliases               | Compatibility additive           | Do not remove while supported clients use aliases.    |
| 018_order_pdfs_bucket                   | Storage additive                 | Remove bucket only after object export.               |
| 019_enterprise_idempotency_fix          | Additive with uniqueness         | Forward repair duplicate idempotency conflicts.       |
| 020_mandatory_phone_and_index           | Destructive backfill             | See below.                                            |
| 021_refresh_summaries_in_rpcs           | Hot-path behavior change         | Forward function replacement if contention appears.   |
| 022_dynamic_categories_units            | Additive                         | Preserve referenced category/unit rows.               |
| 023_batch_serial_party_rates            | Additive                         | Preserve traceability rows.                           |
| 024_customers_phone_mandatory_unique    | Irreversible duplicate overwrite | See below.                                            |
| 025_fractional_stock_quantities         | Additive type widening           | No data-loss rollback needed.                         |
| 026_server_authoritative_invoice_totals | RPC authority change             | Keep alias and forward repair.                        |
| 027_performance_query_indexes           | Additive indexes                 | Drop indexes if needed.                               |
| 028_expand_audit_logging                | Additive triggers                | Disable only with Security owner approval.            |

## Migration 020 Recovery

Migration 020 backfilled missing invoice phone values to `0000000000` and made
`invoices.customer_phone` required. Recovery is not a simple down migration because the original
missing values are gone.

Recovery path:

1. Restore a pre-020 backup to staging.
2. Export invoice ids that had missing or blank phone values.
3. Match invoices to customers, PDFs, or support records.
4. Apply a forward correction migration in production.
5. Record every corrected invoice id.

## Migration 024 Recovery

Migration 024 overwrote duplicate customer phone numbers with synthetic values before adding unique
constraints. Recovery requires business review.

Recovery path:

1. Restore a pre-024 backup to staging.
2. Export duplicate phone groups and affected customer ids.
3. Reconcile with invoices, payments, and support history.
4. Apply a forward correction migration with approved phone values.
5. Preserve old synthetic values in the incident record.
