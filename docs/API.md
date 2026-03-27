# API (v1)

Base: `/api/v1`

## Health
- `GET /health`

## Auth
- `POST /auth/register` (create org + admin)
- `POST /auth/login` -> `{ access_token, refresh_token }`
- `POST /auth/refresh` -> rotates refresh token
- `GET /auth/me`
- `GET /auth/users` (permission: `users.manage`)
- `POST /auth/users` (permission: `users.manage`)

## RBAC (permission: `rbac.manage`)
- `GET /rbac/roles`
- `POST /rbac/roles`
- `GET /rbac/permissions`
- `POST /rbac/grant`
- `POST /rbac/assign`

## Subscriptions (permission: `rbac.manage`)
- `GET /billing/modules`
- `PATCH /billing/modules/{module_code}`

## ERP (permission: `erp.read`)
- `GET /erp/dashboard` (cached 30s)

## HR (permission: `hr.manage`)
- `GET /hr/employees`
- `POST /hr/employees`
- `PATCH /hr/employees/{employee_id}`
- `GET /hr/attendance`
- `POST /hr/attendance`
- `POST /hr/employees/{employee_id}/link-user`
- `GET /hr/leave`
- `POST /hr/leave/{leave_request_id}/decide`
- `GET /hr/qr/clock`
- `GET /hr/payroll/structures`
- `POST /hr/payroll/structures`
- `GET /hr/payroll/calculate/{employee_id}`

## HR Self-service (permission: `hr.self`)
- `GET /hr/me`
- `GET /hr/me/time-entries`
- `POST /hr/me/clock-in`
- `POST /hr/me/clock-out`
- `POST /hr/me/clock/qr`
- `GET /hr/me/leave`
- `POST /hr/me/leave`

## Inventory (permission: `inventory.manage`)
- `GET /inventory/suppliers`
- `POST /inventory/suppliers`
- `GET /inventory/products`
- `POST /inventory/products`
- `PATCH /inventory/products/{product_id}`
- `GET /inventory/products/{product_id}/qr` (SVG)
- `POST /inventory/stock/movements`
- `GET /inventory/stock/levels` (reorder alerts)

## Inventory Read-only (permission: `inventory.read`)
- `GET /inventory/suppliers`
- `GET /inventory/products`
- `GET /inventory/products/{product_id}/qr` (SVG)
- `GET /inventory/stock/levels`

## CRM (permission: `crm.manage`)
- `GET /crm/customers`
- `POST /crm/customers`
- `PATCH /crm/customers/{customer_id}`
- `GET /crm/customers/{customer_id}/orders` (purchase history)
- `GET /crm/opportunities`
- `POST /crm/opportunities`
- `PATCH /crm/opportunities/{opportunity_id}`
- `GET /crm/interactions`
- `POST /crm/interactions`

## Finance (permission: `finance.manage`)
- `GET /finance/transactions`
- `POST /finance/transactions`
- `GET /finance/profit?days=30`
- `POST /finance/payments/collect` (polymorphic payment strategies)

## Commerce (permission: `commerce.manage`)
- `GET /commerce/orders`
- `POST /commerce/orders`
- `GET /commerce/orders/{order_id}`
- `POST /commerce/orders/{order_id}/pay`

## Export management (permission: `export.manage`)
- `GET /exports/orders`
- `POST /exports/orders`
- `PATCH /exports/orders/{order_id}` (rules run on confirm)
- `GET /exports/shipments`
- `POST /exports/shipments`
- `POST /exports/documents` (enqueues Redis job)
- `GET /exports/documents/{export_order_id}`
- `GET /exports/document/{document_id}` (content)
- `GET /exports/readiness` (score + checklist)

## Storefront (public)
- `GET /store/{org_slug}/products`
- `POST /store/{org_slug}/checkout`

## Analytics (permission: `analytics.read`)
- `GET /analytics/overview?days=30`

## AI assistant (permission: `assistant.use`)
- `POST /assistant/chat`
- `GET /assistant/recommendations`
- `GET /assistant/forecast`
- `GET /assistant/analytics`
