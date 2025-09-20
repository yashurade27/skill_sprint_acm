"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  CreditCard,
  MapPin,
  ArrowLeft,
  Eye,
  Loader2
} from "lucide-react"

interface Order {
  id: number
  total_amount: number
  status: string
  payment_status: string
  payment_method: string
  placed_at: string
  notes?: string
  items: OrderItem[]
  user_email: string
  line1?: string
  city?: string
  state?: string
}

interface OrderItem {
  product_id: number
  quantity: number
  price_amount: number
  line_total: number
  product_name: string
  image_url?: string
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/orders")
    }
  }, [status, router])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch(`/api/orders?page=${page}&limit=10`)
      const data = await response.json()

      if (response.ok && data.success) {
        setOrders(data.data.orders)
        setTotalPages(data.data.pagination.totalPages)
      } else {
        throw new Error(data.error || 'Failed to fetch orders')
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [page])

  // Fetch orders
  useEffect(() => {
    if (session?.user) {
      fetchOrders()
    }
  }, [session, fetchOrders])

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />
      case 'delivered':
        return <Truck className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEstimatedDelivery = (orderDate: string, status: string) => {
    if (status.toLowerCase() === 'delivered') return 'Delivered'
    if (status.toLowerCase() === 'cancelled') return 'Cancelled'
    
    const placed = new Date(orderDate)
    const estimated = new Date(placed)
    estimated.setDate(placed.getDate() + 4) // 4 business days
    
    return estimated.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen w-full relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #f97316 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="container mx-auto px-4 max-w-6xl py-30 flex-1 flex items-center justify-center">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
              <p className="text-gray-600">Loading your orders...</p>
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

        <div className="container mx-auto px-4 max-w-6xl py-30 flex-1">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="p-2 bg-white/80 backdrop-blur-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4">
              <h1 className="text-3xl font-serif text-gray-800">My Orders</h1>
              <p className="text-gray-600">Track your orders and delivery status</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6">
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          {/* Orders List */}
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-600 mb-2">No Orders Yet</h2>
                <p className="text-gray-500 mb-6">                      You haven&apos;t placed any orders yet.</p>
                <Button 
                  onClick={() => router.push("/products")}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="bg-white/90 backdrop-blur-sm border-white/20">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-gray-600" />
                          <div>
                            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                            <p className="text-sm text-gray-600">
                              Placed on {formatDate(order.placed_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        
                        <Badge className={getPaymentStatusColor(order.payment_status)}>
                          <CreditCard className="h-3 w-3 mr-1" />
                          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </Badge>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                          className="bg-white/80"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {selectedOrder?.id === order.id ? 'Hide' : 'Details'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Order Summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">₹{order.total_amount}</p>
                          <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                        </div>
                        <Separator orientation="vertical" className="h-8 hidden sm:block" />
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Truck className="h-4 w-4" />
                          <span>Est. delivery: {getEstimatedDelivery(order.placed_at, order.status)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard className="h-4 w-4" />
                        <span className="capitalize">{order.payment_method}</span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {order.items.slice(0, 4).map((item, index) => (
                        <div key={index} className="flex-shrink-0 flex items-center gap-2 bg-white/60 rounded-lg p-2">
                          <Image
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.product_name}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-24">{item.product_name}</p>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex-shrink-0 bg-white/60 rounded-lg p-2 px-3">
                          <p className="text-sm text-gray-600">+{order.items.length - 4} more</p>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {selectedOrder?.id === order.id && (
                      <div className="border-t border-gray-200 pt-4 space-y-4">
                        {/* Shipping Address */}
                        {order.line1 && (
                          <div className="bg-white/60 rounded-lg p-4">
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <MapPin className="h-4 w-4" />
                              Shipping Address
                            </h4>
                            <p className="text-sm text-gray-600">
                              {order.line1}{order.city ? `, ${order.city}` : ''}{order.state ? `, ${order.state}` : ''}
                            </p>
                          </div>
                        )}

                        {/* All Items */}
                        <div className="bg-white/60 rounded-lg p-4">
                          <h4 className="font-medium mb-3">Order Items</h4>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center gap-4 p-3 bg-white/60 rounded-lg">
                                <Image
                                  src={item.image_url || "/placeholder.svg"}
                                  alt={item.product_name}
                                  width={60}
                                  height={60}
                                  className="rounded object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-gray-800">{item.product_name}</h5>
                                  <p className="text-sm text-gray-600">
                                    ₹{item.price_amount} × {item.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">₹{item.line_total}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                          <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-2">Order Notes</h4>
                            <p className="text-sm text-blue-700">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="bg-white/80 backdrop-blur-sm"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      onClick={() => setPage(pageNum)}
                      className={pageNum === page ? "bg-orange-500 hover:bg-orange-600" : "bg-white/80 backdrop-blur-sm"}
                      size="sm"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="bg-white/80 backdrop-blur-sm"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  )
}