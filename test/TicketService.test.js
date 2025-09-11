import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';
import TicketService from '../src/pairtest/TicketService.js';

// jest.mock('../src/thirdparty/seatbooking/SeatReservationService');
// jest.mock('../src/thirdparty/paymentgateway/TicketPaymentService');
/*
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';
import TicketService from '../src/pairtest/TicketService.js';
*/

// import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService';
// import SeatReservationService from '../src/thirdparty/seatbooking/SeatReservationService';
// jest.mock(SeatReservationService);
// jest.mock(TicketPaymentService);

// const TicketPaymentService = require ('../src/thirdparty/paymentgateway/TicketPaymentService.js');
// const SeatReservationService = require ('../src/thirdparty/seatbooking/SeatReservationService.js');
// jest.mock('../src/thirdparty/seatbooking/SeatReservationService');
// jest.mock('../src/thirdparty/paymentgateway/TicketPaymentService');

// let TicketPaymentService;
// let SeatReservationService;

describe('TicketService', () => {
    let service;

    // beforeAll(() => {
    //     const module = import('../src/thirdparty/paymentgateway/TicketPaymentService');
    //     TicketPaymentService = module.default;
    //     // const SeatReservationService = require('../src/thirdparty/seatbooking/SeatReservationService.js');
    //     // jest.mock('../src/thirdparty/seatbooking/SeatReservationService.js');
    //     jest.mock('../src/thirdparty/paymentgateway/TicketPaymentService');

    //     // TicketPaymentService.processPayment = jest.fn();
    //     // SeatReservationService.reserveSeats = jest.fn();
    // });

    beforeEach(() => {
        service = new TicketService();
        // TicketPaymentService.processPayment.mockClear();
        // SeatReservationService.reserveSeats.mockClear();
    });

    it('should throw exception when accountId is not a valid/positive integer', () => {
        const invalidAccountIds = [-100, 0, 1.5, 'a', {}, [], undefined, null];

        invalidAccountIds.map((accountId) => {
            expect(() => {
                service.purchaseTickets(accountId, { ADULT: 1 });
            }).toThrow(InvalidPurchaseException);
        });
    });

    it('should throw exception for requests with invalid ticket types', () => {
        const accountId = 100;
        const invalidRequests = [{}, [], '', 10];
        invalidRequests.map((request) => {
            expect(() => {
                service.purchaseTickets(accountId, request);
            }).toThrow(InvalidPurchaseException);
        });
    });

    it('should throw error as number of tickets exceed 25', () => {
        const accountId = 101;
        expect(() => {
            service.purchaseTickets(accountId, { ADULT: 30, CHILD: 10, INFANT: 0 });
        }).toThrow(InvalidPurchaseException);
    });

    it('Infant without an Adult, should throw error ', () => {
        const accountId = 102;
        expect(() => {
            service.purchaseTickets(accountId, { ADULT: 0, CHILD: 0, INFANT: 1 });
        }).toThrow(InvalidPurchaseException);
    });

    it('Child woithout an Adult, should throw error ', () => {
        const accountId = 103;
        expect(() => {
            service.purchaseTickets(accountId, { ADULT: 0, CHILD: 1, INFANT: 0 });
        }).toThrow(InvalidPurchaseException);
    });

    it('Zero tickets of all types - should throw error ', () => {
        const accountId = 104;
        expect(() => {
            service.purchaseTickets(accountId, { ADULT: 0, CHILD: 0, INFANT: 0 });
        }).toThrow(InvalidPurchaseException);
    });

    it('More Infants than Adults - should throw error ', () => {
        const accountId = 105;
        expect(() => {
            service.purchaseTickets(accountId, { ADULT: 2, CHILD: 1, INFANT: 5 });
        }).toThrow(InvalidPurchaseException);
    });

    it('Only Adult tickets within limit - should pass', () => {
        const accountId = 106;
        expect(() => { service.purchaseTickets(accountId, { ADULT: 1 }); }).not.toThrow();
    });

    it('More than one Adult tickets within limit - should pass', () => {
        const accountId = 107;
        expect(() => { service.purchaseTickets(accountId, { ADULT: 1 }, { ADULT: 1 }); }).not.toThrow();
    });

    it('Invalid request for zero tickets - should fail', () => {
        const accountId = 108;
        expect(() => { service.purchaseTickets(accountId, { ADULT: 1 }, { ADULT: -1 }); }).toThrow();
    });

    it('Valid tickets - should pass', () => {
        const accountId = 109;
        expect(() => { service.purchaseTickets(accountId, { ADULT: 2 }, { ADULT: -1 }); }).not.toThrow();
    });

    it('should purchase tickets', () => {
        const accountId = 110;
        expect(() => { service.purchaseTickets(accountId, { ADULT: 2, CHILD: 2, INFANT: 2 }); }).not.toThrow();
    });

    it('should purchase tickets', () => {
        const accountId = 111;
        expect(() => { service.purchaseTickets(accountId, { ADULT: 20, CHILD: 5, INFANT: 5 }); }).not.toThrow();
    });
    
    // it('should purchase tickets', () => {
    //     const accountId = 112;
    //     service.purchaseTickets(accountId, { ADULT: 1, CHILD: 0, INFANT: 0 });

    //     expect(TicketPaymentService.makePayment).toHaveBeenCalledWith(accountId, 20);
    //     expect(SeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 1);
    // });

//   it('should mock the class', () => {
//     // Mock the implementation
//     TicketPaymentService.mockImplementation(() => ({
//       makePayment: jest.fn().mockReturnValue('success'),
//     }));

//     const instance = new TicketPaymentService();
//     expect(instance.makePayment()).toBe('success');
//   });

});
