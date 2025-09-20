"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, MapPin, CreditCard, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface OrderItem {
  order_item_id: number
  product_id: number
  product_name: string
  product_description: string
  image_url: string
  quantity: number
  price_cents: number
  price_amount: number
  line_total: number
  category_name: string
}

interface Order {
  id: number
  user_id: number
  user_email: string
  user_name: string
  user_phone: string
  total_cents: number
  total_amount: number
  status: string
  payment_status: string
  payment_method: string
  razorpay_order_id: string
  razorpay_payment_id: string
  placed_at: string
  notes: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  address_phone?: string
  items: OrderItem[]
}

export default function OrderDetails() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()
      
      if (data.success) {
        setOrder(data.data.order)
      } else {
        alert("Order not found")
        router.push("/admin/orders")
      }
    } catch (error) {
      console.error("Failed to fetch order:", error)
      alert("Failed to load order")
      router.push("/admin/orders")
    } finally {
      setLoading(false)
    }
  }, [orderId, router])

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.role !== "admin") {
      router.push("/auth/login")
      return
    }

    fetchOrder()
  }, [session, status, router, fetchOrder])

  const updateOrderStatus = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change the order status to "${newStatus}"?`)) {
      return
    }

    setUpdating(true)

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        fetchOrder() // Refresh order data
        alert("Order status updated successfully")
      } else {
        alert(data.error || "Failed to update order status")
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("Failed to update order status")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || session.user?.role !== "admin" || !order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Orders
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.placed_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
              <Badge className={getPaymentStatusColor(order.payment_status)}>
                {order.payment_status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.order_item_id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.product_name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        {item.category_name && (
                          <p className="text-sm text-gray-500">{item.category_name}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>Qty: {item.quantity}</span>
                          <span>₹{item.price_amount}</span>
                          <span className="font-medium">Total: ₹{item.line_total}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Order Total:</span>
                    <span>₹{order.total_amount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Name:</span>
                  <p className="text-gray-600">{order.user_name || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-gray-600">{order.user_email}</p>
                </div>
                {order.user_phone && (
                  <div>
                    <span className="font-medium">Phone:</span>
                    <p className="text-gray-600">{order.user_phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.line1 ? (
                  <div className="text-gray-600">
                    <p>{order.line1}</p>
                    {order.line2 && <p>{order.line2}</p>}
                    <p>{order.city}, {order.state} {order.postal_code}</p>
                    {order.address_phone && <p>Phone: {order.address_phone}</p>}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No shipping address provided</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Method:</span>
                  <p className="text-gray-600 capitalize">{order.payment_method}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className={getPaymentStatusColor(order.payment_status)}>
                    {order.payment_status}
                  </Badge>
                </div>
                {order.razorpay_order_id && (
                  <div>
                    <span className="font-medium">Razorpay Order ID:</span>
                    <p className="text-gray-600 text-sm font-mono">{order.razorpay_order_id}</p>
                  </div>
                )}
                {order.razorpay_payment_id && (
                  <div>
                    <span className="font-medium">Razorpay Payment ID:</span>
                    <p className="text-gray-600 text-sm font-mono">{order.razorpay_payment_id}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Update Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.status === "pending" && (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => updateOrderStatus("confirmed")}
                      disabled={updating}
                    >
                      Mark as Confirmed
                    </Button>
                  )}
                  {order.status === "confirmed" && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => updateOrderStatus("delivered")}
                      disabled={updating}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                  {order.status !== "cancelled" && order.status !== "delivered" && (
                    <Button 
                      variant="destructive"
                      className="w-full"
                      onClick={() => updateOrderStatus("cancelled")}
                      disabled={updating}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>

                {updating && (
                  <p className="text-sm text-gray-500 mt-2">Updating...</p>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}