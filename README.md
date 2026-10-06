# boat charter

# Role & Goal

Act as an expert full-stack engineer. Build a complete, production-ready Boat Rental & Charter Web Application featuring a Customer Storefront and a Management Admin Panel.

The website name is "Boat Charter".

Build the frontend, backend, database, authentication/authorization where required, payment architecture, financial management, API integrations, validation, error handling, and all required functionality.

The application must be fully functional and production-ready. Do not create fake buttons, placeholder functionality, or UI elements that do nothing.

---

# 1. Theme & UI Styling

* Aesthetic: Nautical & modern luxury.

* Use:

  * Deep Ocean Navy: #0A192F

  * Crisp White: #FFFFFF

  * Cyan/Teal accents: #00B4D8

  * Soft Slate Gray: #F8F9FA

* Navigation Header:

  * Logo/brand name: "Boat Charter"

  * Navigation links:

    * Explore Fleet

    * How It Works

    * Contact

  * Explicit "Admin Dashboard" button/toggle.

* Fully mobile-friendly and responsive.

* Professionally designed UI with consistent spacing, typography, buttons, cards, forms, tables, modals, alerts, loading states, and empty states.

* The design should feel like a real commercial luxury boat charter platform rather than a basic demo.

* Maintain a consistent nautical/luxury visual identity throughout the customer and admin interfaces.

---

# 2. Data Models / Database Schema

Set up the following data models with proper persistent database storage.

## 2.1 Boats

Fields:

* id

* title

* category

  * Yacht

  * Speedboat

  * Pontoon

  * Catamaran

  * or other appropriate categories

* capacity

* length_ft

* hourly_rate

* daily_rate

* location

* description

* amenities — array of strings

  * Captain Provided

  * Bluetooth

  * Fuel Included

  * Snorkel Gear

  * etc.

* image_urls — array of image links

* is_available

* created_at

* updated_at

## 2.2 Bookings

Fields:

* id

* boat_id

* customer_name

* customer_email

* customer_phone

* start_date

* end_date

* booking_type

  * hourly

  * daily

* duration

* total_price

* payment_status

* status

  * pending

  * confirmed

  * cancelled

* created_at

* updated_at

Bookings must have a proper relationship with the selected boat and associated payment/financial records.

## 2.3 Payment Methods

Create a payment method model containing safe payment metadata.

Only ONE payment method should be available to customers.

The payment method must be an online payment method connected to the configured payment provider/API.

Do NOT add:

* Cash on Delivery

* Bank Transfer

* PayPal

* Multiple payment options

Only the single configured online payment method should appear at checkout.

Fields:

* id

* customer_id or booking_id

* payment_method_type

* provider

* last_four_digits where applicable

* payment_status

* transaction_id

* amount

* currency

* created_at

* updated_at

Never store:

* full credit/debit card numbers

* CVV

* passwords

* payment secrets

* raw payment credentials

Use the payment provider's secure/tokenized system instead.

## 2.4 Financial Records

Create a dedicated financial records model.

Fields:

* id

* booking_id

* transaction_id

* customer_name

* boat_id

* amount

* currency

* transaction_type

  * booking_payment

  * refund

  * adjustment

  * other

* payment_method

* payment_status

* transaction_date

* notes

* created_at

* updated_at

Financial records must automatically update when:

* payments are completed

* payments fail

* bookings are confirmed

* bookings are cancelled

* refunds are issued

* adjustments are made

## 2.5 Financial History

Maintain a permanent chronological history of financial activity.

Track:

* booking payments

* successful payments

* failed payments

* refunds

* adjustments

* payment status changes

* relevant booking changes

* transaction IDs

* timestamps

* associated customer

* associated booking

* associated boat

Financial history should remain traceable and should not disappear simply because a booking is cancelled or modified.

---

# 3. Customer Storefront

## Hero Section

Create an attractive hero section with:

* Strong headline

* Supporting text

* Professional nautical imagery

* Primary CTA

* Quick filter/search bar

Quick filters:

* Location

* Date Range

* Guest Count

* Boat Category

The filters must actually work against the available boat/booking data.

---

# 4. Fleet Grid

Display responsive boat cards containing:

* Main photo thumbnail

* Category tag

* Boat title

* Key specifications badge

Example:

"Up to 10 guests • 32 ft"

Also display:

* Hourly rate

* Daily rate

* Availability

* Location

* "View & Book" button

Every button must work.

---

# 5. Boat Detail Modal / Page

Create a professional boat details experience.

Include:

* Large main image

* Thumbnail image gallery

* Image switching

* Detailed specifications

* Capacity

* Length

* Category

* Location

* Pricing

* Description

* Amenities

* Availability

* Booking CTA

Amenities should use appropriate icons.

---

# 6. Interactive Booking Calculator

Allow customers to:

* Select Booking Type:

  * Hourly

  * Daily

* Select Start Date/Time

* Select End Date/Time or Duration

* Enter guest count

* Calculate pricing in real time.

The calculation must use the boat's actual stored rates.

For example:

Hourly booking:

hourly_rate × number_of_hours

Daily booking:

daily_rate × number_of_days

Handle appropriate rounding and minimum-duration rules where required.

Display:

* Selected boat

* Booking type

* Rental duration

* Rate

* Subtotal

* Applicable fees if configured

* Total price

---

# 7. Customer Information

Collect:

* Full Name

* Email

* Phone Number

Validate all required information.

Use proper:

* Email validation

* Phone validation

* Required-field validation

* Date validation

* Availability validation

Prevent customers from booking unavailable boats or overlapping reservations where applicable.

---

# 8. Payment During Booking

Use ONE payment method only.

The checkout must not display multiple payment options.

Do not include:

* Cash on Delivery

* Bank Transfer

* PayPal

* Multiple payment methods

The customer should see only the configured online payment method.

Display:

* Booking amount

* Payment method

* Payment status

* Final total

The customer should be able to submit the booking/payment request through a properly designed workflow.

After successful booking/payment processing:

1. Save booking.

2. Save payment information.

3. Save transaction ID.

4. Save payment status.

5. Create financial record.

6. Create financial history entry.

7. Associate everything with the booking.

8. Show a professional confirmation modal/page.

9. Display booking/reference ID.

---

# 9. Request Booking

The main CTA should be:

"Request Booking"

When clicked:

1. Validate customer information.

2. Validate boat availability.

3. Validate dates/times.

4. Calculate total price.

5. Create booking.

6. Initiate/process payment using the single configured payment method.

7. Save payment information.

8. Create financial record.

9. Create financial history entry.

10. Show confirmation.

11. Display booking/reference ID.

12. Display appropriate payment status.

Handle errors gracefully.

---

# 10. Payment Method & Payment Architecture

Build the application so it is ready to connect to a real payment gateway.

There must be ONE payment method only.

The payment architecture must be designed so that the actual payment provider can be connected using API credentials that will be supplied later.

Do not hard-code payment provider credentials.

Do not expose payment secrets in frontend code.

---

# 11. Payment API Key Configuration

Leave secure configuration/environment-variable placeholders for payment API keys and credentials so they can be added later without changing the application code.

Create clearly named environment variables such as:

PAYMENT_API_KEY=

PAYMENT_SECRET_KEY=

PAYMENT_PUBLIC_KEY=

PAYMENT_WEBHOOK_SECRET=

PAYMENT_API_URL=

PAYMENT_ENVIRONMENT=

Requirements:

* Never hard-code real API keys.

* Never expose secret keys in frontend code.

* Never commit secrets to GitHub.

* Use environment variables.

* Use secure server-side configuration.

* Support development/test mode.

* Support production/live mode.

* Include a .env.example file showing where credentials should be added.

* Do not include real credentials in .env.example.

* Keep the payment integration modular so the actual provider can be connected later without redesigning the application.

* The customer checkout should display only the one configured payment method.

---

# 12. Payment Webhooks

Build backend webhook endpoints/placeholders for:

* Payment successful

* Payment failed

* Payment pending

* Payment refunded

* Payment cancelled

* Payment status updates

Webhook processing must:

1. Receive the provider event.

2. Verify webhook signatures/secrets.

3. Reject unauthorized webhook requests.

4. Find the associated transaction.

5. Update payment status.

6. Update booking payment status.

7. Create/update financial records.

8. Add financial history entries.

9. Prevent duplicate webhook processing where applicable.

The architecture must be ready for a real payment provider once API keys are supplied.

---

# 13. Development / Demo Payment Mode

The application should work in development/demo mode without real payment API keys.

Create clearly identified test/mock payment functionality for development.

For example:

* Test Payment Successful

* Test Payment Failed

* Test Refund

Do not make the mock system look like a real processed transaction in production.

---

# 14. Admin Management Panel

Create an Admin Panel accessible through:

/admin

Also include the Admin Dashboard navigation button.

---

# 15. Admin Dashboard Overview

Create professional dashboard summary cards.

Display:

* Total Boats Listed

* Total Bookings

* Pending Requests

* Estimated Revenue

* Total Payments

* Paid Revenue

* Pending Payments

* Failed Payments

* Refunds

* Net Revenue

All statistics must be calculated from real database records.

Do not hard-code dashboard numbers.

---

# 16. Boat Management — CRUD

Create complete Boat Management functionality.

## Table

Display:

* Boat

* Category

* Capacity

* Length

* Location

* Hourly Rate

* Daily Rate

* Availability

* Actions

Availability status:

* Available

* Maintenance / Unavailable

## Add New Boat

Create an "Add New Boat" form/modal.

Fields:

* Title

* Category dropdown

* Capacity

* Length

* Hourly Rate

* Daily Rate

* Location

* Description

* Amenities checkboxes

* Image File Upload or Image URL fields

Support multiple images where appropriate.

## Actions

Every boat must support:

* Add

* View

* Edit

* Delete

* Availability toggle

All actions must work with the backend/database.

---

# 17. Booking Management

Create a professional booking management table.

Display:

* Customer Name

* Customer Email

* Customer Phone

* Boat Title

* Rental Dates/Times

* Booking Type

* Duration

* Total Amount

* Payment Status

* Booking Status

* Created Date

Quick actions:

* Approve

* Reject

* View

* Cancel where appropriate

Approve:

pending → confirmed

Reject:

pending → cancelled

Make sure booking/payment/financial records remain synchronized.

---

# 18. Payment Management

Create a dedicated Admin Payment Management section.

Display:

* Transaction ID

* Booking ID

* Customer

* Boat

* Amount

* Payment Method

* Payment Provider

* Payment Status

* Transaction Date

Payment statuses:

* Pending

* Paid

* Failed

* Refunded

Allow appropriate authorized administrative actions.

Do not allow administrators to access sensitive raw card information.

Only display the single configured payment method.

---

# 19. Financial Records

Create a dedicated Financial Records section.

Display:

* Transaction ID

* Booking

* Customer

* Boat

* Transaction Type

* Amount

* Payment Method

* Payment Status

* Transaction Date

* Notes

Transaction types:

* Booking Payment

* Refund

* Adjustment

* Other

Add filters for:

* Date range

* Transaction type

* Payment status

* Booking

* Customer

* Boat

Show financial summaries:

* Gross Revenue

* Successful Payments

* Pending Payments

* Failed Payments

* Refunds

* Adjustments

* Net Revenue

Financial calculations must use actual database records.

---

# 20. Financial History

Create a dedicated Financial History section.

Display a chronological timeline/table of financial events.

Include:

* Event

* Transaction ID

* Booking ID

* Customer

* Amount

* Status

* Event Type

* Date/Time

* Notes

Maintain permanent historical records for:

* Payments

* Refunds

* Failed transactions

* Adjustments

* Status changes

* Other financial events

Do not overwrite historical transactions in a way that destroys the audit trail.

---

# 21. Revenue & Financial Calculations

Implement proper financial calculations.

Revenue should be based on successful/paid transactions.

Do not count:

* Pending payments

* Failed payments

* Cancelled unpaid bookings

as completed revenue.

Correctly account for:

* Successful payments

* Refunds

* Adjustments

Calculate:

Net Revenue = Successful Payments − Refunds ± Adjustments

Use appropriate currency handling and avoid floating-point errors for financial calculations.

---

# 22. Seed Data

Pre-populate the application with 4 realistic sample boats.

Boat 1:

Sea Ray 320 Sundancer

Boat 2:

Lagoon 42 Catamaran

Boat 3:

Yamaha 242X Speedboat

Boat 4:

Sunseeker Manhattan 52

Each boat must include:

* High-resolution Unsplash boat image links

* Realistic specifications

* Capacity

* Length

* Hourly rate

* Daily rate

* Location

* Description

* Amenities

* Availability

Also create dummy pending bookings so the application looks alive immediately.

Create realistic sample:

* Payment records

* Payment statuses

* Financial records

* Financial history

associated with the seeded bookings.

---

# 23. Backend Architecture

Build the backend properly for:

* Boats

* Bookings

* Customers where required

* Payments

* Payment Methods

* Financial Records

* Financial History

* Admin functionality

Implement:

* Proper database relationships

* API endpoints

* Validation

* Error handling

* Authentication/authorization where required

* Secure data handling

* Server-side validation

* Transaction handling

* Consistent API responses

* Proper HTTP status codes

* Logging where appropriate

---

# 24. Data Integrity

Ensure:

* A booking always references a valid boat.

* Payments always reference the appropriate booking.

* Financial records reference the appropriate transaction/booking.

* Financial history remains traceable.

* Deleted boats should not break historical bookings/financial records.

* Historical financial records should remain available.

* Payment updates must not accidentally duplicate revenue.

* Webhook events should be idempotent where applicable.

* Booking availability must be checked before confirmation.

* Concurrent booking requests must be handled safely.

---

# 25. Authentication & Admin Security

Protect /admin.

Implement appropriate admin authentication and authorization.

Do not expose:

* Admin data

* Financial data

* Payment information

* API secrets

to unauthenticated customers.

Keep payment secrets strictly server-side.

---

# 26. Validation & Error Handling

Every form must have:

* Required-field validation

* Correct data-type validation

* Proper error messages

* Loading states

* Success states

* Failure states

Handle:

* Database errors

* Payment failures

* API failures

* Invalid dates

* Invalid booking durations

* Unavailable boats

* Duplicate transactions

* Invalid payment configuration

* Network failures

Provide user-friendly messages rather than exposing raw backend errors.

---

# 27. Responsive Design

The entire application must work professionally on:

* Desktop

* Laptop

* Tablet

* Mobile

Admin tables should be responsive and usable on smaller screens.

Booking forms and payment interfaces must be mobile-friendly.

---

# 28. Every Button Must Work

Do not create decorative/non-functional controls.

Every button, link, form, modal, toggle, filter, search field, booking action, payment action, CRUD action, admin action, and navigation item must perform its intended function.

Examples:

* View & Book → opens the correct boat details/booking interface.

* Add Boat → creates a boat.

* Edit → updates a boat.

* Delete → deletes/archives appropriately.

* Availability Toggle → updates availability.

* Approve → confirms booking.

* Reject → cancels booking.

* Payment → initiates the configured payment flow.

* Refund → creates the appropriate refund workflow/financial record.

* Filters → actually filter results.

* Search → actually searches.

* Admin Dashboard → opens /admin.

* Customer navigation → opens the correct sections.

---

# 29. Production Readiness

Build the application as a real production-ready system.

Include:

* Clean project architecture

* Reusable components

* Secure backend

* Database persistence

* Environment configuration

* .env.example

* Payment API placeholders

* API/webhook architecture

* Error handling

* Validation

* Responsive UI

* Loading states

* Empty states

* Confirmation dialogs

* Seed data

* Proper financial calculations

* Proper payment status handling

* Proper booking status handling

* Secure admin area

Do not leave core functionality as a future TODO.

---

# 30. Final Requirement

Build the complete production-ready "Boat Charter" application with:

* Professional nautical luxury design

* Customer storefront

* Fleet browsing

* Boat details

* Boat image galleries

* Search/filtering

* Booking calculator

* Hourly and daily rentals

* Customer information

* One online payment method only

* No Cash on Delivery

* No Bank Transfer

* No PayPal

* Payment API integration architecture

* Secure payment API key placeholders

* Payment webhooks

* Booking management

* Admin Dashboard

* Boat CRUD

* Payment management

* Financial Records

* Financial History

* Revenue calculations

* Refund handling

* Database persistence

* Backend APIs

* Authentication/security

* Responsive design

* Seed data

* Proper error handling

* Proper validation

* Production-ready architecture

The final application must feel like a real commercial boat charter platform, not a static demo.

All requirements in this prompt must be implemented with actual working functionality and proper frontend/backend integration.

Do not remove or simplify any of the requirements above.

Do not add additional payment methods unless explicitly requested later.

Do not add Cash on Delivery under any circumstances unless specifically requested later.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://boatcharter.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9b89ffa1-3600-410b-91ed-79ddcc5a7ec9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
