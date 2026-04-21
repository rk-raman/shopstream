/**
 * Invoice PDF Generation Service
 *
 * Generates professional invoices using PDFKit.
 * Returns a readable stream that can be piped to HTTP response.
 */

const PDFDocument = require("pdfkit");
const Order = require("../models/Order.model");
const ApiError = require("../../../shared/utils/apiError");

const COLORS = {
  primary: "#2874f0",
  dark: "#1a1a2e",
  gray: "#666666",
  light: "#f5f5f5",
  border: "#e0e0e0",
  green: "#388e3c",
};

const COMPANY = {
  name: "ShopStream",
  tagline: "Your one-stop e-commerce platform",
  address: "123 E-Commerce Street, Digital City, IN 560001",
  phone: "+91 1800-SHOP-STREAM",
  email: "support@shopstream.com",
  gstin: "29AABCS1429B1ZB",
  website: "www.shopstream.com",
};

class InvoiceService {
  /**
   * Generate invoice PDF for an order.
   * @param {string} orderId
   * @param {string} userId
   * @param {string} role
   * @returns {PDFDocument} readable stream
   */
  async generateInvoice(orderId, userId, role) {
    const order = await Order.findById(orderId)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name")
      .populate("items.seller", "firstName lastName businessName");

    if (!order) throw ApiError.notFound("Order not found");

    // Access control
    if (role === "customer" && order.customer._id.toString() !== userId) {
      throw ApiError.forbidden("Access denied");
    }
    if (role === "seller") {
      const hasSellersItems = order.items.some(
        (item) => item.seller?._id?.toString() === userId
      );
      if (!hasSellersItems) throw ApiError.forbidden("Access denied");
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    this.drawHeader(doc, order);
    this.drawAddresses(doc, order);
    this.drawItemsTable(doc, order);
    this.drawPriceSummary(doc, order);
    this.drawPaymentInfo(doc, order);
    this.drawFooter(doc, order);

    doc.end();
    return doc;
  }

  drawHeader(doc, order) {
    // Company name
    doc
      .fontSize(24)
      .fillColor(COLORS.primary)
      .font("Helvetica-Bold")
      .text(COMPANY.name, 50, 45);

    doc
      .fontSize(8)
      .fillColor(COLORS.gray)
      .font("Helvetica")
      .text(COMPANY.tagline, 50, 72);

    // INVOICE title
    doc
      .fontSize(28)
      .fillColor(COLORS.dark)
      .font("Helvetica-Bold")
      .text("INVOICE", 400, 45, { align: "right" });

    // Invoice details (right side)
    const rightX = 400;
    let y = 80;

    doc.fontSize(9).font("Helvetica").fillColor(COLORS.gray);
    doc.text(`Invoice No: ${order.orderNumber}`, rightX, y, { align: "right" });
    y += 14;
    doc.text(
      `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
      rightX,
      y,
      { align: "right" }
    );
    y += 14;
    doc.text(`Status: ${order.status.toUpperCase()}`, rightX, y, {
      align: "right",
    });

    // Divider
    doc
      .moveTo(50, 120)
      .lineTo(545, 120)
      .strokeColor(COLORS.primary)
      .lineWidth(2)
      .stroke();
  }

  drawAddresses(doc, order) {
    const y = 135;
    const customer = order.customer;
    const addr = order.shippingAddress;
    const billing = order.billingAddress || addr;

    // Sold By (company)
    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.dark);
    doc.text("Sold By:", 50, y);
    doc.fontSize(8).font("Helvetica").fillColor(COLORS.gray);
    doc.text(COMPANY.name, 50, y + 14);
    doc.text(COMPANY.address, 50, y + 26, { width: 200 });
    doc.text(`GSTIN: ${COMPANY.gstin}`, 50, y + 50);

    // Ship To
    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.dark);
    doc.text("Ship To:", 300, y);
    doc.fontSize(8).font("Helvetica").fillColor(COLORS.gray);
    doc.text(addr.fullName, 300, y + 14);
    doc.text(addr.addressLine1, 300, y + 26);
    if (addr.addressLine2) doc.text(addr.addressLine2, 300, y + 38);
    const addrOffset = addr.addressLine2 ? 50 : 38;
    doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 300, y + addrOffset);
    doc.text(`Phone: ${addr.phone}`, 300, y + addrOffset + 12);

    // Customer details
    if (customer) {
      doc.text(
        `Email: ${customer.email}`,
        300,
        y + addrOffset + 24
      );
    }
  }

  drawItemsTable(doc, order) {
    let y = 230;

    // Table header
    doc.rect(50, y, 495, 22).fill(COLORS.primary);
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#ffffff");
    doc.text("#", 55, y + 6);
    doc.text("Product", 75, y + 6);
    doc.text("Qty", 320, y + 6, { width: 40, align: "center" });
    doc.text("Price", 365, y + 6, { width: 60, align: "right" });
    doc.text("Discount", 425, y + 6, { width: 50, align: "right" });
    doc.text("Total", 480, y + 6, { width: 60, align: "right" });

    y += 22;

    // Table rows
    order.items.forEach((item, index) => {
      const effectivePrice = item.discountPrice || item.price;
      const lineTotal = effectivePrice * item.quantity;
      const discountAmt =
        item.discountPrice && item.discountPrice < item.price
          ? (item.price - item.discountPrice) * item.quantity
          : 0;

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(50, y, 495, 28).fill(COLORS.light);
      }

      doc.fontSize(8).font("Helvetica").fillColor(COLORS.dark);
      doc.text(String(index + 1), 55, y + 8);

      // Product name (truncate if long)
      const productName =
        item.productName || (typeof item.product === "object" ? item.product.name : "Product");
      const displayName =
        productName.length > 40
          ? productName.substring(0, 40) + "..."
          : productName;
      doc.text(displayName, 75, y + 4, { width: 240 });

      // Variant info
      if (item.variant?.value) {
        doc
          .fontSize(7)
          .fillColor(COLORS.gray)
          .text(`${item.variant.name}: ${item.variant.value}`, 75, y + 16);
      }

      doc.fontSize(8).fillColor(COLORS.dark);
      doc.text(String(item.quantity), 320, y + 8, { width: 40, align: "center" });
      doc.text(`₹${item.price.toLocaleString("en-IN")}`, 365, y + 8, {
        width: 60,
        align: "right",
      });

      if (discountAmt > 0) {
        doc.fillColor(COLORS.green);
        doc.text(`-₹${discountAmt.toLocaleString("en-IN")}`, 425, y + 8, {
          width: 50,
          align: "right",
        });
      } else {
        doc.fillColor(COLORS.gray);
        doc.text("-", 425, y + 8, { width: 50, align: "right" });
      }

      doc.font("Helvetica-Bold").fillColor(COLORS.dark);
      doc.text(`₹${lineTotal.toLocaleString("en-IN")}`, 480, y + 8, {
        width: 60,
        align: "right",
      });

      y += 28;

      // Page break if needed
      if (y > 680) {
        doc.addPage();
        y = 50;
      }
    });

    // Table bottom border
    doc.moveTo(50, y).lineTo(545, y).strokeColor(COLORS.border).lineWidth(1).stroke();

    return y;
  }

  drawPriceSummary(doc, order) {
    let y = doc.y + 15;
    if (y > 650) {
      doc.addPage();
      y = 50;
    }

    const rightCol = 430;
    const valCol = 480;

    doc.fontSize(9).font("Helvetica").fillColor(COLORS.gray);

    // Subtotal
    doc.text("Subtotal:", rightCol, y, { width: 50, align: "right" });
    doc.fillColor(COLORS.dark);
    doc.text(`₹${order.subtotal.toLocaleString("en-IN")}`, valCol, y, {
      width: 60,
      align: "right",
    });
    y += 16;

    // Discount
    if (order.discount > 0) {
      doc.fillColor(COLORS.gray);
      doc.text("Discount:", rightCol, y, { width: 50, align: "right" });
      doc.fillColor(COLORS.green);
      doc.text(`-₹${order.discount.toLocaleString("en-IN")}`, valCol, y, {
        width: 60,
        align: "right",
      });
      y += 16;
    }

    // Shipping
    doc.fillColor(COLORS.gray);
    doc.text("Shipping:", rightCol, y, { width: 50, align: "right" });
    doc.fillColor(COLORS.dark);
    doc.text(
      order.shippingCharges === 0
        ? "FREE"
        : `₹${order.shippingCharges.toLocaleString("en-IN")}`,
      valCol,
      y,
      { width: 60, align: "right" }
    );
    y += 16;

    // Tax
    doc.fillColor(COLORS.gray);
    doc.text("GST (18%):", rightCol, y, { width: 50, align: "right" });
    doc.fillColor(COLORS.dark);
    doc.text(`₹${order.tax.toLocaleString("en-IN")}`, valCol, y, {
      width: 60,
      align: "right",
    });
    y += 4;

    // Total line
    doc
      .moveTo(rightCol - 10, y + 10)
      .lineTo(545, y + 10)
      .strokeColor(COLORS.primary)
      .lineWidth(1.5)
      .stroke();
    y += 18;

    // Grand Total
    doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.dark);
    doc.text("Total:", rightCol - 20, y, { width: 70, align: "right" });
    doc.fillColor(COLORS.primary);
    doc.text(`₹${order.totalAmount.toLocaleString("en-IN")}`, valCol, y, {
      width: 60,
      align: "right",
    });

    // Coupon info
    if (order.coupon?.code) {
      y += 20;
      doc.fontSize(8).font("Helvetica").fillColor(COLORS.green);
      doc.text(
        `Coupon Applied: ${order.coupon.code} (-₹${order.coupon.discountAmount.toLocaleString("en-IN")})`,
        rightCol - 80,
        y,
        { width: 200, align: "right" }
      );
    }
  }

  drawPaymentInfo(doc, order) {
    let y = doc.y + 30;
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    // Payment box
    doc.rect(50, y, 240, 60).fill(COLORS.light);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.dark);
    doc.text("Payment Information", 60, y + 8);

    doc.fontSize(8).font("Helvetica").fillColor(COLORS.gray);
    const method =
      order.payment.method === "cod"
        ? "Cash on Delivery"
        : order.payment.method?.toUpperCase();
    doc.text(`Method: ${method}`, 60, y + 24);
    doc.text(
      `Status: ${order.payment.status === "paid" ? "Paid" : order.payment.status}`,
      60,
      y + 36
    );
    if (order.payment.transactionId) {
      doc.text(`Transaction ID: ${order.payment.transactionId}`, 60, y + 48);
    }
  }

  drawFooter(doc, order) {
    const pageHeight = doc.page.height;
    const y = pageHeight - 80;

    // Separator
    doc
      .moveTo(50, y)
      .lineTo(545, y)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();

    // Thank you message
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(COLORS.primary)
      .text("Thank you for shopping with ShopStream!", 50, y + 10, {
        align: "center",
      });

    // Contact info
    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor(COLORS.gray)
      .text(
        `${COMPANY.email} | ${COMPANY.phone} | ${COMPANY.website}`,
        50,
        y + 26,
        { align: "center" }
      );

    // Legal note
    doc
      .fontSize(6)
      .text(
        "This is a computer-generated invoice and does not require a signature.",
        50,
        y + 40,
        { align: "center" }
      );
  }
}

module.exports = new InvoiceService();
