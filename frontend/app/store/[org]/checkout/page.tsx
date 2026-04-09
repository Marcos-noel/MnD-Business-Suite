"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Cart as CartType,
  getCart, 
  ShippingAddress,
  Order
} from "@/lib/store";
import { IconArrowLeft, IconBox, IconCheck } from "@/components/icons/AppIcons";
import { CreditCard, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const params = useParams<{ org: string }>();
  const searchParams = useSearchParams();
  const org = params.org;
  const router = useRouter();
  const cartId = searchParams.get("cart");
  
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  
  // Payment state (for Stripe/PayPal integration)
  const [paymentProvider, setPaymentProvider] = useState("stripe");
  const [paymentReference, setPaymentReference] = useState("");

  // Load cart
  useEffect(() => {
    (async () => {
      if (!cartId) {
        setError("No cart found");
        setLoading(false);
        return;
      }
      
      try {
        const cartData = await getCart(org, cartId);
        setCart(cartData);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [org, cartId]);

  async function handleCheckout() {
    if (!cartId || !cart) return;
    
    try {
      setProcessing(true);
      setError(null);
      
      const shippingAddress: ShippingAddress = {
        name: shippingName,
        phone: shippingPhone,
        address_line1: addressLine1,
        address_line2: addressLine2 || undefined,
        city: city,
        state: state,
        postal_code: postalCode,
        country: "KEN",
      };
      
      const res = await fetch(`/api/store/${org}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_id: cartId,
          customer_name: customerName,
          customer_email: customerEmail,
          shipping_address: shippingAddress,
          provider: paymentProvider,
          reference: paymentReference,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Checkout failed");
      }
      
      setOrder(data);
      
      // Clear cart from localStorage
      localStorage.removeItem("mnd_cart_id");
      
      // Redirect to confirmation after a delay
      setTimeout(() => {
        router.push(`/store/${org}/order/${data.id}?email=${encodeURIComponent(customerEmail)}`);
      }, 2000);
      
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--c-surface))] p-6">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (order) {
    return (
      <div className="min-h-screen bg-[hsl(var(--c-surface))] p-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Order Placed!</h1>
          <div className="mt-2 text-[hsl(var(--c-muted-2))]">
            Thank you for your order. A confirmation email has been sent to {customerEmail}
          </div>
          <Card className="mt-8 p-6 text-left">
            <div className="text-sm text-[hsl(var(--c-muted-2))]">Order Number</div>
            <div className="text-lg font-mono font-semibold">{order.order_no}</div>
          </Card>
          <Link href={`/store/${org}`}>
            <Button className="mt-8">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen bg-[hsl(var(--c-surface))] p-6">
        <div className="mx-auto max-w-4xl">
          <Link 
            href={`/store/${org}`}
            className="inline-flex items-center gap-1 text-sm text-[hsl(var(--c-muted-2))] hover:text-[hsl(var(--c-text))] mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
          
          <Card className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-[hsl(var(--c-muted-2))]" />
            <div className="mt-4 text-lg font-medium">Checkout unavailable</div>
            <div className="mt-2 text-[hsl(var(--c-muted-2))]">{error}</div>
            <Link href={`/store/${org}/cart`}>
              <Button className="mt-6">View Cart</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--c-surface))]">
      <div className="mx-auto max-w-5xl p-6">
        <Link 
          href={`/store/${org}/cart`}
          className="inline-flex items-center gap-1 text-sm text-[hsl(var(--c-muted-2))] hover:text-[hsl(var(--c-text))] mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
        
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {error && (
          <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-[hsl(var(--c-muted-2))]">Full Name</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-[hsl(var(--c-muted-2))]">Email</label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[hsl(var(--c-muted-2))]">Recipient Name</label>
                  <Input
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-[hsl(var(--c-muted-2))]">Phone Number</label>
                  <Input
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-[hsl(var(--c-muted-2))]">Address Line 1</label>
                  <Input
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Street address"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-[hsl(var(--c-muted-2))]">Address Line 2 (Optional)</label>
                  <Input
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm text-[hsl(var(--c-muted-2))]">City</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Nairobi"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[hsl(var(--c-muted-2))]">County/State</label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Nairobi"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[hsl(var(--c-muted-2))]">Postal Code</label>
                    <Input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="00100"
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Payment</h2>
              <div className="flex items-center gap-2 mb-4 text-sm text-[hsl(var(--c-muted-2))]">
                <Lock className="h-4 w-4" />
                Your payment is secure and encrypted
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setPaymentProvider("stripe")}
                    className={`flex-1 p-4 border rounded-lg text-center transition ${
                      paymentProvider === "stripe"
                        ? "border-primary bg-primary/10"
                        : "border-[hsl(var(--c-border))] hover:border-[hsl(var(--c-muted-2))]"
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Card Payment</div>
                  </button>
                  <button
                    onClick={() => setPaymentProvider("mpesa")}
                    className={`flex-1 p-4 border rounded-lg text-center transition ${
                      paymentProvider === "mpesa"
                        ? "border-primary bg-primary/10"
                        : "border-[hsl(var(--c-border))] hover:border-[hsl(var(--c-muted-2))]"
                    }`}
                  >
                    <div className="h-6 w-6 mx-auto mb-2 bg-green-600 rounded-full"></div>
                    <div className="text-sm font-medium">M-Pesa</div>
                  </button>
                </div>
                
                <div>
                  <label className="text-sm text-[hsl(var(--c-muted-2))]">Payment Reference (Optional)</label>
                  <Input
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="MPESA transaction ID or card token"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              {cart && (
                <div className="space-y-3 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--c-muted-2))]">
                        {item.product_name} x {item.quantity}
                      </span>
                      <span>{cart.currency} {item.line_total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-t border-[hsl(var(--c-border))] my-4"></div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--c-muted-2))]">Subtotal</span>
                  <span>{cart?.currency} {cart?.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--c-muted-2))]">Shipping</span>
                  <span>TBD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--c-muted-2))]">Tax</span>
                  <span>TBD</span>
                </div>
              </div>
              
              <div className="border-t border-[hsl(var(--c-border))] my-4"></div>
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{cart?.currency} {cart?.subtotal.toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={handleCheckout}
                disabled={processing || !customerName || !customerEmail || !addressLine1 || !city || !state || !postalCode}
              >
                {processing ? "Processing..." : "Place Order"}
              </Button>
              
              <p className="mt-4 text-xs text-center text-[hsl(var(--c-muted-2))]">
                By placing this order, you agree to our terms of service
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
