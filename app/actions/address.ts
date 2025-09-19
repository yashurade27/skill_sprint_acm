"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  createAddressSchema,
  updateAddressSchema,
  type CreateAddressInput,
  type UpdateAddressInput,
} from "@/lib/types";

export async function createAddress(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized: Please log in to add an address");
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = createAddressSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input: " + parsed.error.issues.map(i => i.message).join(", "));
    }

    const address: CreateAddressInput = parsed.data;

    const result = await query(
      `INSERT INTO addresses (user_id, line1, line2, city, state, postal_code, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        session.user.id,
        address.line1,
        address.line2 || null,
        address.city,
        address.state,
        address.postal_code,
        address.phone || null,
      ]
    );

    const addressId = result.rows[0].id;
    revalidatePath("/profile/addresses");
    revalidatePath("/checkout"); // Address list might be shown in checkout

    return {
      success: true,
      message: "Address added successfully",
      addressId,
    };
  } catch (error) {
    console.error("Create address error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add address",
    };
  }
}

export async function updateAddress(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized: Please log in to update address");
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = updateAddressSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input: " + parsed.error.issues.map(i => i.message).join(", "));
    }

    const address: UpdateAddressInput = parsed.data;

    // Check if address belongs to user
    const ownershipCheck = await query(
      "SELECT user_id FROM addresses WHERE id = $1",
      [address.id]
    );

    if (ownershipCheck.rows.length === 0) {
      throw new Error("Address not found");
    }

    if (ownershipCheck.rows[0].user_id !== session.user.id) {
      throw new Error("Unauthorized: You can only update your own addresses");
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(address)) {
      if (key !== "id" && value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(address.id); // For WHERE clause

    const sql = `UPDATE addresses SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
    const result = await query(sql, values);

    revalidatePath("/profile/addresses");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Address updated successfully",
      address: result.rows[0],
    };
  } catch (error) {
    console.error("Update address error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update address",
    };
  }
}

export async function deleteAddress(addressId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized: Please log in to delete address");
    }

    if (typeof addressId !== "number" || addressId <= 0) {
      throw new Error("Invalid address ID");
    }

    // Check if address belongs to user
    const ownershipCheck = await query(
      "SELECT user_id FROM addresses WHERE id = $1",
      [addressId]
    );

    if (ownershipCheck.rows.length === 0) {
      throw new Error("Address not found");
    }

    if (ownershipCheck.rows[0].user_id !== session.user.id) {
      throw new Error("Unauthorized: You can only delete your own addresses");
    }

    // Check if address is used in any orders
    const orderCheck = await query(
      "SELECT COUNT(*) as order_count FROM orders WHERE address_id = $1",
      [addressId]
    );

    if (parseInt(orderCheck.rows[0].order_count) > 0) {
      throw new Error("Cannot delete address: It has been used in orders. You can edit it instead.");
    }

    await query("DELETE FROM addresses WHERE id = $1", [addressId]);

    revalidatePath("/profile/addresses");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Address deleted successfully",
    };
  } catch (error) {
    console.error("Delete address error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete address",
    };
  }
}

export async function setDefaultAddress(addressId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized: Please log in to set default address");
    }

    if (typeof addressId !== "number" || addressId <= 0) {
      throw new Error("Invalid address ID");
    }

    // Check if address belongs to user
    const ownershipCheck = await query(
      "SELECT user_id FROM addresses WHERE id = $1",
      [addressId]
    );

    if (ownershipCheck.rows.length === 0) {
      throw new Error("Address not found");
    }

    if (ownershipCheck.rows[0].user_id !== session.user.id) {
      throw new Error("Unauthorized: You can only modify your own addresses");
    }

    // Update user's default address ID in users table
    await query(
      "UPDATE users SET default_address_id = $1 WHERE id = $2",
      [addressId, session.user.id]
    );

    revalidatePath("/profile/addresses");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Default address updated successfully",
    };
  } catch (error) {
    console.error("Set default address error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to set default address",
    };
  }
}