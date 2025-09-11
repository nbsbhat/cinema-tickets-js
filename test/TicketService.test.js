import { expect } from "chai";

import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';
import TicketService from '../src/pairtest/TicketService.js';
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService.js";
import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService.js';

describe('TicketService', () => {
    // unit tests for the purchaseTickets method
    describe('purchaseTickets tests', () => {
        let service;

        beforeEach(() => {
            service = new TicketService();
        });

        it('should throw exception when accountId is not a valid/positive integer', () => {
            const invalidAccountIds = [-100, 0, 1.5, 'a', {}, []];
            invalidAccountIds.map((accountId) => {
                expect(() =>
                    service.purchaseTickets(accountId, { ADULT: 1 })
                )
                .to.throw(InvalidPurchaseException);
            });
        });

        it('should throw exception for requests with invalid ticket types', () => {
            const invalidRequests = [{}, [], '', 10];
            invalidRequests.map((request) => {
                expect(() => {
                    service.purchaseTickets(100, request);
                })
                .to.throw(InvalidPurchaseException);
            });
        });

        it('should throw error as number of tickets exceed 25', () => {
            expect(() => {
                service.purchaseTickets(101, { ADULT: 30, CHILD: 10, INFANT: 0 });
            })
            .to.throw(InvalidPurchaseException);
        });

        it('Infant without an Adult, should throw error ', () => {
            expect(() => {
                service.purchaseTickets(102, { ADULT: 0, CHILD: 0, INFANT: 1 });
            })
            .to.throw(InvalidPurchaseException);
        });

        it('Child woithout an Adult, should throw error ', () => {
            expect(() => {
                service.purchaseTickets(103, { ADULT: 0, CHILD: 1, INFANT: 0 });
            })
            .to.throw(InvalidPurchaseException);
        });

        it('Zero tickets of all types - should throw error ', () => {
            expect(() => {
                service.purchaseTickets(104, { ADULT: 0, CHILD: 0, INFANT: 0 });
            })
            .to.throw(InvalidPurchaseException);
        });

        it('More Infants than Adults - should throw error ', () => {
            expect(() => {
                service.purchaseTickets(105, { ADULT: 2, CHILD: 1, INFANT: 5 });
            }).to.throw(InvalidPurchaseException);
        });

        it('Only Adult tickets within limit - should pass', () => {
            expect(() => { 
                service.purchaseTickets(106, { ADULT: 1 });
            })
            .not.to.throw();
        });

        it('More than one Adult tickets within limit - should pass', () => {
            expect(() => { 
                service.purchaseTickets(107, { ADULT: 1 }, { ADULT: 1 });
            })
            .not.to.throw();
        });

        it('Invalid request for zero tickets - should fail', () => {
            expect(() => { 
                service.purchaseTickets(108, { ADULT: 1 }, { ADULT: -1 });
            })
            .to.throw();
        });

        it('Valid tickets - should pass', () => {
            expect(() => {
                service.purchaseTickets(109, { ADULT: 2 }, { ADULT: -1 });
            })
            .not.to.throw();
        });

        it('Valid purchase request - should pass', () => {
            expect(() => {
                service.purchaseTickets(110, { ADULT: 2, CHILD: 2, INFANT: 2 });
            })
            .not.to.throw();
        });

        it('Valid request for max tickets - should pass', () => {
            expect(() => {
                service.purchaseTickets(111, { ADULT: 20, CHILD: 5, INFANT: 5 });
            })
            .not.to.throw();
        });

        it('makePayment to be calledOnce - should pass', () => {
            service.purchaseTickets(112, { ADULT: 1, CHILD: 0, INFANT: 0 });
            expect(() =>
                new TicketPaymentService().makePayment().calledOnce()
            );
        });

        it('reserveSeat to be calledOnce - should pass', () => {
            service.purchaseTickets(113, { ADULT: 1, CHILD: 2 });
            expect(() =>
                new SeatReservationService().reserveSeat().calledOnce()
            );
        });

    });
});
