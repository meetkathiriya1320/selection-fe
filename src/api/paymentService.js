import api from "./axios";

export const createPaymentOrder = async (amount) => {
    const response = await api.post("/payment/create-order", { amount });
    return response.data;
};

export const verifyPayment = async (paymentData) => {
    const response = await api.post("/payment/verify", paymentData);
    return response.data;
};

export const downloadInvoice = async (orderId) => {
    const response = await api.get(`/order/${orderId}/invoice`, {
        responseType: 'blob',
    });
    return response.data;
};

/**
 * Refund the deposit for an order.
 * @param {string} paymentId - Internal MongoDB Payment _id
 * @param {number|null} refundAmount - Amount in ₹ (null = auto from order deposit)
 * @param {string} reason - Optional reason text
 */
export const refundDeposit = async (paymentId, refundAmount = null, reason = '') => {
    const payload = { payment_id: paymentId };
    if (refundAmount) payload.refund_amount = refundAmount;
    if (reason) payload.reason = reason;
    const response = await api.post("/payment/refund-deposit", payload);
    return response.data;
};
