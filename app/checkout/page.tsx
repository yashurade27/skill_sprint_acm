"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import { ArrowLeft, CreditCard, Truck, MapPin, Lock, Plus, Minus, Trash2 } from "lucide-react"
import { useStore } from "@/lib/store"

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { status } = useSession()
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useStore()
  const [step, setStep] = useState(1) // 1: Cart Review, 2: Shipping, 3: Payment
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= 500 ? 0 : 50
  const total = subtotal + deliveryFee

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/checkout")
    }
  }, [status, router])

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  const handleRazorpayPayment = async () => {
    const res = await initializeRazorpay()
    if (!res) {
      setError("Razorpay SDK failed to load. Please try again.")
      toast.error("Payment system failed to load. Please try again.")
      return
    }

    const loadingToast = toast.loading('Preparing payment...')

    try {
      setError("")
      
      // Create order on backend
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total * 100, // Convert to paise
          currency: 'INR',
        }),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Order creation failed:', errorData)
        toast.error(errorData.error || 'Failed to create payment order', {
          id: loadingToast
        })
        throw new Error(errorData.error || 'Failed to create payment order')
      }

      const orderData = await orderResponse.json()

      if (!orderData.success) {
        toast.error(orderData.error || 'Failed to create payment order', {
          id: loadingToast
        })
        throw new Error(orderData.error || 'Failed to create payment order')
      }

      toast.success('Payment initialized! Complete the payment.', {
        id: loadingToast
      })

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "KadamKate's Snacks",
        description: "Payment for your order",
        order_id: orderData.data.id,
        handler: async function (response: Record<string, string>) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: cartItems.map(item => ({
                  product_id: item.id,
                  quantity: item.quantity,
                  price_cents: Math.round(item.price * 100)
                })),
                shipping_address: shippingInfo,
                total_cents: Math.round(total * 100)
              }),
            })

            const verifyData = await verifyResponse.json()
            
            if (verifyData.success) {
              clearCart()
              toast.success('Payment successful! Redirecting to order confirmation...')
              router.push(`/order-success?order=${verifyData.data.order.id}`)
            } else {
              toast.error(verifyData.error || 'Payment verification failed')
              throw new Error(verifyData.error || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed. Please contact support.')
            setError('Payment verification failed. Please contact support if money was deducted.')
          }
        },
        modal: {
          ondismiss: function() {
            setError('Payment was cancelled. You can try again.')
            toast.error('Payment was cancelled. You can try again.')
          }
        },
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          contact: shippingInfo.phone,
        },
        theme: {
          color: "#f97316", // Orange theme
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (error) {
      console.error('Payment initialization error:', error)
      setError('Failed to initialize payment. Please check your internet connection and try again.')
      toast.error('Failed to initialize payment. Please try again.', {
        id: loadingToast
      })
    }
  }

  const handleQuantityChange = (id: number, change: number) => {
    const item = cartItems.find((item) => item.id === id)
    if (item) {
      const newQuantity = item.quantity + change
      if (newQuantity > 0) {
        updateQuantity(id, newQuantity)
      }
    }
  }

  const handleRemoveItem = (id: number) => {
    removeFromCart(id)
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    setError("")

    const loadingToast = toast.loading(
      paymentMethod === 'razorpay' ? 'Preparing payment...' : 'Placing your order...'
    )

    try {
      if (paymentMethod === 'razorpay') {
        toast.dismiss(loadingToast)
        await handleRazorpayPayment()
        return
      }

      // For COD and other payment methods
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price_cents: Math.round(item.price * 100)
        })),
        shipping_address: shippingInfo,
        payment_method: paymentMethod,
        total_cents: Math.round(total * 100)
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          clearCart()
          toast.success('Order placed successfully! Redirecting...', {
            id: loadingToast
          })
          router.push(`/order-success?order=${result.data.order.id}`)
        } else {
          toast.error(result.error || 'Failed to place order', {
            id: loadingToast
          })
          throw new Error(result.error || 'Failed to place order')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        toast.error(errorData.error || 'Failed to place order', {
          id: loadingToast
        })
        throw new Error(errorData.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Order placement error:', error)
      const errorMessage = `Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      setError(errorMessage)
      toast.error(errorMessage, {
        id: loadingToast
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return cartItems.length > 0
      case 2:
        return (
          shippingInfo.firstName &&
          shippingInfo.lastName &&
          shippingInfo.email &&
          shippingInfo.phone &&
          shippingInfo.address &&
          shippingInfo.city &&
          shippingInfo.state &&
          shippingInfo.pincode
        )
      case 3:
        return paymentMethod === "cod" || paymentMethod === "razorpay"
      default:
        return false
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full relative">
        {/* Radial Gradient Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #f97316 100%)",
          }}
        />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="container mx-auto px-4 max-w-7xl py-20 flex-1 flex flex-col justify-center">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-8 border-white/20 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    )
  }

  if (cartItems.length === 0 && step === 1) {
    return (
      <div className="min-h-screen w-full relative">
        {/* Radial Gradient Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #f97316 100%)",
          }}
        />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="container mx-auto px-4 max-w-7xl py-16 flex-1 flex flex-col justify-center">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-8 border-white/20 max-w-md mx-auto">
              <h1 className="text-3xl font-serif text-gray-800 mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8">Add some delicious items to your cart to continue.</p>
              <Button onClick={() => router.push("/products")} className="bg-orange-500 hover:bg-orange-600">
                Continue Shopping
              </Button>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #f97316 100%)",
        }}
      />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="container mx-auto px-4 max-w-7xl py-30 flex-1">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => (step > 1 ? setStep(step - 1) : router.push("/products"))}
              className="p-2 bg-white/80 backdrop-blur-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
        
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 border-white/20">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      step >= stepNumber ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <span className={`ml-2 font-medium ${step >= stepNumber ? "text-orange-600" : "text-gray-500"}`}>
                    {stepNumber === 1 ? "Cart" : stepNumber === 2 ? "Shipping" : "Payment"}
                  </span>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-0.5 ml-4 ${step > stepNumber ? "bg-orange-500" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 mx-auto max-w-2xl">
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Cart Review */}
              {step === 1 && (
                <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Review Your Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white/60">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.price * item.quantity}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Shipping Information */}
              {step === 2 && (
                <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                          placeholder="Enter first name"
                          className="bg-white/80"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                          placeholder="Enter last name"
                          className="bg-white/80"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                          placeholder="Enter email address"
                          className="bg-white/80"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          placeholder="Enter phone number"
                          className="bg-white/80"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        placeholder="Enter full address"
                        className="bg-white/80"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          placeholder="Enter city"
                          className="bg-white/80"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                          placeholder="Enter state"
                          className="bg-white/80"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          value={shippingInfo.pincode}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                          placeholder="Enter pincode"
                          className="bg-white/80"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Payment Information */}
              {step === 3 && (
                <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Method Selection */}
                    <div>
                      <Label className="text-base font-medium mb-4 block">Payment Method</Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg bg-white/60">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="cursor-pointer">
                            Cash on Delivery
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg bg-white/60">
                          <RadioGroupItem value="razorpay" id="razorpay" />
                          <Label htmlFor="razorpay" className="flex items-center gap-2 cursor-pointer">
                            <CreditCard className="h-4 w-4" />
                            Pay Online (Cards/UPI/Wallets)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Cash on Delivery */}
                    {paymentMethod === "cod" && (
                      <div className="text-center p-8 border rounded-lg bg-green-50">
                        <p className="text-gray-600 mb-2">Pay when your order is delivered</p>
                        <p className="text-sm text-gray-500">No additional charges</p>
                      </div>
                    )}

                    {/* Online Payment */}
                    {paymentMethod === "razorpay" && (
                      <div className="text-center p-8 border rounded-lg bg-orange-50">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                        <p className="text-gray-600 mb-4">
                          Pay securely using Cards, UPI, Wallets, or Net Banking
                        </p>
                        <Badge variant="secondary">Powered by Razorpay</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 bg-white/90 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items Summary */}
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </span>
                    </div>
                    {deliveryFee === 0 && (
                      <div className="text-sm text-green-600">🎉 Free delivery on orders above ₹500</div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    {step < 3 ? (
                      <Button
                        onClick={() => setStep(step + 1)}
                        disabled={!isStepValid(step)}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        {step === 1 ? "Proceed to Shipping" : "Proceed to Payment"}
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={!isStepValid(step) || isProcessing}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        {isProcessing ? "Processing..." : `Place Order - ₹${total}`}
                      </Button>
                    )}
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-4">
                    <Lock className="h-4 w-4" />
                    <span>Secure checkout</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}