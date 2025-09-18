// ========================================
// EXAMPLE SERVER ACTION STRUCTURE
// ========================================

// app/actions/cart-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

export async function addToCart(productId: number, quantity: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      redirect('/login')
    }

    // Check if item already exists in cart
    const existing = await query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [session.user.id, productId]
    )

    if (existing.rows.length > 0) {
      // Update existing item
      await query(
        'UPDATE cart_items SET quantity = quantity + $1, updated_at = now() WHERE user_id = $2 AND product_id = $3',
        [quantity, session.user.id, productId]
      )
    } else {
      // Add new item
      await query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [session.user.id, productId, quantity]
      )
    }

    revalidatePath('/cart')
    return { success: true, message: 'Item added to cart' }
  } catch (error) {
    console.error('Add to cart error:', error)
    return { success: false, message: 'Failed to add item to cart' }
  }
}

// ========================================
// EXAMPLE API ROUTE STRUCTURE
// ========================================

// app/api/products/route.ts



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let sql = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = true
    `
    const params: any[] = []

    if (category) {
      sql += ` AND c.slug = $${params.length + 1}`
      params.push(category)
    }

    if (search) {
      sql += ` AND (p.name ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    sql += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await query(sql, params)

    return NextResponse.json({
      products: result.rows,
      total: result.rowCount
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin only - create product
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // Validate and create product...
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}