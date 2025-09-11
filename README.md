# cinema-tickets-js


# Business Rules
- There are 3 types of tickets i.e. Infant, Child, and Adult.
- The ticket prices are based on the type of ticket (see table below).
- The ticket purchaser declares how many and what type of tickets they want to buy.
- Multiple tickets can be purchased at any given time.
- Only a maximum of 25 tickets that can be purchased at a time.
- Infants do not pay for a ticket and are not allocated a seat. They will be sitting on an Adult's lap.
- Child and Infant tickets cannot be purchased without purchasing an Adult ticket.

|   Ticket Type    |     Price   |
| ---------------- | ----------- |
|    INFANT        |    £0       |
|    CHILD         |    £15      |
|    ADULT         |    £25      |

## Constraints
- The TicketService interface CANNOT be modified. 
- The code in the thirdparty.* packages CANNOT be modified.
- The `TicketTypeRequest` SHOULD be an immutable object.

## Assumptions:
- All accounts with an id greater than zero are valid. They also have sufficient funds to pay for any no of tickets.
- The `TicketPaymentService` implementation is an external provider with no defects. You do not need to worry about how the actual payment happens.
- The payment will always go through once a payment request has been made to the `TicketPaymentService`.
- The `SeatReservationService` implementation is an external provider with no defects.
- The seat will always be reserved once a reservation request has been made to the `SeatReservationService`.


### Run the tests

- Install project dependencies with `npm install`
- install development (unit test) dependencies with: `npm install mocha chai --save-dev`
- run the unit tests: `npm run test`


Output:

```

> cinema-tickets-javascript@1.0.1 test
> mocha



  TicketService
    purchaseTickets tests
      ✔ should throw exception when accountId is not a valid/positive integer
      ✔ should throw exception for requests with invalid ticket types
      ✔ should throw error as number of tickets exceed 25
      ✔ Infant without an Adult, should throw error
      ✔ Child woithout an Adult, should throw error
      ✔ Zero tickets of all types - should throw error
      ✔ More Infants than Adults - should throw error
      ✔ Only Adult tickets within limit - should pass
      ✔ More than one Adult tickets within limit - should pass
      ✔ Invalid request for zero tickets - should fail
      ✔ Valid tickets - should pass
      ✔ Valid purchase request - should pass
      ✔ Valid request for max tickets - should pass
      ✔ makePayment to be calledOnce - should pass
      ✔ reserveSeat to be calledOnce - should pass


  15 passing (14ms)

  ```