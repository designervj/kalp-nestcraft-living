import {
  CreateOrderPayload,
  OrderPayload,
  OrderPayment,
  PaymentGateway,
} from "./base";

export class RazorpayGateway extends PaymentGateway {
  id = "razorpay";
  name = "Razorpay";

  async loadscript(): Promise<void> {
    if (document.getElementById("razorpay-script")) return;
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(script);
    });
  }

  async initiatePayment(
    payload: OrderPayload,
    key: string,
    address: string,
  ): Promise<OrderPayment> {
    await this.loadscript();

    return new Promise((resolve, reject) => {
      const options = {
        key,
        amount: payload.amount,
        currency: payload.currency,
        name: payload.customerName,
        description: "Order Payment",
        image: "https://example.com/logo.png",
        order_id: payload.orderId,
        prefill: {
          name: payload.customerName,
          email: payload.customerEmail,
        },
        notes: {
          address: address,
        },
        handler: (response: any) => {
          resolve({
            transactionId: response.razorpay_payment_id,
            method: "razorpay",
            paymentGatewayResponse: {
              status: "captured",
              amount: payload.amount,
              currency: payload.currency,
            },
            paidAt: new Date().toISOString(),
            extra: {
              razorpaySignature: response.razorpay_signature,
            },
          });
        },
        modal: {
          ondismiss: () => {
            reject(new Error("Payment cancelled"));
          },
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    });
  }
}
