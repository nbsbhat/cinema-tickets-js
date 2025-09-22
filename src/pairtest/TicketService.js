import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  #TicketPrices = {
    ADULT: 25,
    CHILD: 15,
    INFANT: 0
  };
  #MAX_TICKETS = 25;

  /**
   * Check if an object is empty
   * @param {Object} object to be checked 
   * @returns {Boolean} - true if object is empty
   */
  #isEmptyObject = (obj) => Object.keys(obj).length === 0;

  /**
   * Check if ticket types in the request are valid
   * @param {Object} ticketRequest containing ticket types
   * @returns {Boolean} - true if all ticket types are valid
   */
  #isValidTypeOfTickets(ticketRequest) {
    const ticketTypes = this.#TicketPrices ? Object.keys(this.#TicketPrices) : [];
    for (const type in ticketRequest) {
      if (!ticketTypes.includes(type)) {
        return false;
      }
    }
    return true;
  }

  /**
   * check if number of tickets in the request are valid (non-negative integers)
   * @param {Object} ticketRequest containing number of tickets against each ticket type
   * @returns {Boolean} - true if all number of tickets are non-negative integers
   */
  #isValidNumberOfTickets(ticketRequest) {
    return (ticketRequest.ADULT === undefined || (Number.isInteger(ticketRequest.ADULT) && ticketRequest.ADULT >= 0)) &&
      (ticketRequest.CHILD === undefined || (Number.isInteger(ticketRequest.CHILD) && ticketRequest.CHILD >= 0)) &&
      (ticketRequest.INFANT === undefined || (Number.isInteger(ticketRequest.INFANT) && ticketRequest.INFANT >= 0));
  }

  /**
   * check if accountId is a valid positive integer
   * @param {number} account identifier
   * @returns {Boolean} - true if accountId is a valid positive integer
   */
  #isValidAccountId(accountId) {
    return Number.isInteger(accountId) && accountId > 0;
  }

  /**
   * forms a consolidated ticket request object from array of ticket requests
   * @param {Object[]} ticketRequests having ticket type and number of tickets
   * @returns an objeect with ticket types as keys and number of tickets as values
   */
  #parseRequestDetails(ticketRequests) {
    let ticketDetails = {};

    try {
      ticketRequests.map((request) => {
        for (const [key, value] of Object.entries(request)) {
          let ticket = new TicketTypeRequest(key, value);
          ticketDetails[ticket.getTicketType()] = ticketDetails[ticket.getTicketType()] ?
            ticketDetails[ticket.getTicketType()] + ticket.getNoOfTickets() :
            ticket.getNoOfTickets();
        }
      });
    }
    catch (error) {
      throw new InvalidPurchaseException('Invalid ticket request format');
    }
    return ticketDetails;
  }

  /**
   * Validates the business rules for ticket purchase request, namely:
   *  An accountId must be a valid positive integer.
   *  A minimum of one ticket must be purchased.
   *  At least one Adult ticket must be purchased.
   *  Child and Infant tickets cannot be purchased without an Adult ticket.
   *  More infants than adults is not allowed as they must be accompanied by an adult & will be sitting on an Adult's lap.
   *  The number of tickets must be a non-negative integer.
   *  Multiple tickets can be purchased at any given time.
   *  A maximum of 25 tickets can be purchased at a time.
   *  Infants do not pay for a ticket and are not allocated a seat.
   * @param {number} account identifier
   * @param {number} totalTickets is the total number of tickets requested
   * @param {Object} ticketRequest consoloidated ticket request object
   * @throws InvalidPurchaseException - for invalid ticket requests
   * @returns {void}
   */
  #validateRulesForTicketRequest(accountId, totalTickets, ticketRequest) {
    if (!this.#isValidAccountId(accountId)) {
      throw new InvalidPurchaseException('Account ID must be a positive integer');
    }

    if (this.#isEmptyObject(ticketRequest)) {
      throw new InvalidPurchaseException('Minimum of one ticket type request must be provided');
    }

    if (!this.#isValidTypeOfTickets(ticketRequest)) {
      throw new InvalidPurchaseException('Invalid ticket type provided');
    }

    if (!this.#isValidNumberOfTickets(ticketRequest)) {
      throw new InvalidPurchaseException('Number of tickets must be a non-negative integer');
    }

    if (!ticketRequest.ADULT || ticketRequest.ADULT <= 0) {
      throw new InvalidPurchaseException(`At least one adult ticket must be purchased`);
    }

    if (ticketRequest.CHILD > 0 || ticketRequest.INFANT > 0) {
      if (ticketRequest.ADULT <= 0) {
        throw new InvalidPurchaseException('At least one adult ticket must be purchased with child or infant tickets');
      }
    }

    // Infants are not allocated a seat, and will be sitting on an Adult's lap.
    // console.log(ticketRequest.INFANT, ticketRequest.ADULT, ticketRequest.INFANT > ticketRequest.ADULT)
    if (ticketRequest.INFANT > 0 &&
      (ticketRequest.INFANT > ticketRequest.ADULT)) {
      throw new InvalidPurchaseException(`More infants than adults is not allowed`);
    }

    if (totalTickets > this.#MAX_TICKETS) {
      throw new InvalidPurchaseException(`The purchase request for ${totalTickets} exceeded ${this.#MAX_TICKETS} tickets`);
    }

    if (totalTickets == 0) {
      throw new InvalidPurchaseException(`Invalid purchase request for ${totalTickets} tickets`);
    }
  }

  /**
   * Calculates total number of seats to be reserved
   * @param {Object} tickets - consolidated ticket request object
   * @returns total number of seats to be purchased (Infants do not require a seat)
   */
  #getSeatsToReserve(tickets) {
    if (tickets) {
      return tickets.ADULT + (tickets.CHILD || 0); // Infants will sit on an Adult's lap
    }
  }

  /**
   * Calculates total amount to be paid for the tickets
   * @param {Object} tickets consolidated ticket request object
   * @returns total amount to be paid
   */
  #calculateAmount(tickets) {
    if (tickets) {
      return (
        tickets.ADULT * this.#TicketPrices.ADULT +
        (tickets.CHILD || 0) * this.#TicketPrices.CHILD +
        (tickets.INFANT || 0) * this.#TicketPrices.INFANT
      );
    }
  }

  /**
   * Purchase tickets for a given account identifier
   * @param {number} accountId - account identifier
   * @param  {...any} ticketTypeRequests - iterable ticket purchase requests
   * @throws InvalidPurchaseException - for invalid purchase requests
   * @returns {void}  
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    try {
      const ticketRequests = this.#parseRequestDetails(ticketTypeRequests);
      const totalTickets = this.#getSeatsToReserve(ticketRequests);

      this.#validateRulesForTicketRequest(accountId, totalTickets, ticketRequests);
      const totalAmount = this.#calculateAmount(ticketRequests);

      // Assumption: 
      //  The following services are synchronous and will complete successfully.

      // make a payment via TicketPaymentService
      new TicketPaymentService().makePayment(accountId, totalAmount);
      // reserving seats via SeatReservationService
      new SeatReservationService().reserveSeat(accountId, totalTickets);

      // return success/failure status if needed - based on payment and reservation service responses
    }
    catch (error) {
      // handle and log errors
      if (error instanceof InvalidPurchaseException) {
        throw new InvalidPurchaseException(error.message);
      }
    }
  }
}

/**
  Example usage:
  new TicketService().purchaseTickets(1, { ADULT: 2, CHILD: 1, INFANT: 1 });
 */
