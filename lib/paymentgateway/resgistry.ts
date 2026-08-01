import { PaymentGateway } from "./base";
import { RazorpayGateway } from "./razorpay";

const gatewayRegistry: Record<string, PaymentGateway> = {
  razorpay: new RazorpayGateway(),
};

export function getGateway(id: string): PaymentGateway {
  const gw = gatewayRegistry[id];
  if (!gw) {
    throw new Error(`Payment gateway ${id} not found`);
  }
  return gw;
}
