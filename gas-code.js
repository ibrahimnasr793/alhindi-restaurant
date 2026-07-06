// ================================================
// كود Google Apps Script لمطعم الهندي
// الخطوات:
// 1. افتح ملف Google Sheets الخاص بك
// 2. من القائمة اختار: Extensions > Apps Script
// 3. احذف الكود الموجود والصق هذا الكود كله
// 4. احفظ الملف (Ctrl+S)
// 5. اختار من القائمة: Deploy > New deployment
// 6. اختار نوع: Web app
// 7. Execute as: Me
// 8. Who has access: Anyone
// 9. اضغط Deploy وانسخ الرابط (URL)
// 10. ضع الرابط في ملف js/cart.js في المتغير SHEETS_URL
// ================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("الطلبات");
    
    // إنشاء الشيت إذا لم يكن موجوداً
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("الطلبات");
      
      // إعداد الهيدر
      var headers = [
        "رقم الطلب",
        "تاريخ ووقت الطلب",
        "اسم العميل",
        "رقم الهاتف",
        "نوع الطلب",
        "العنوان",
        "الأصناف المطلوبة",
        "الإجمالي (جنيه)",
        "ملاحظات",
        "حالة الطلب"
      ];
      
      sheet.appendRow(headers);
      
      // تنسيق الهيدر
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1a1a2e");
      headerRange.setFontColor("#ffd700");
      headerRange.setFontWeight("bold");
      headerRange.setFontSize(12);
      headerRange.setHorizontalAlignment("center");
      headerRange.setVerticalAlignment("middle");
      sheet.setRowHeight(1, 40);
      
      // ضبط عرض الأعمدة
      sheet.setColumnWidth(1, 150);  // رقم الطلب
      sheet.setColumnWidth(2, 180);  // تاريخ ووقت
      sheet.setColumnWidth(3, 150);  // اسم العميل
      sheet.setColumnWidth(4, 130);  // رقم الهاتف
      sheet.setColumnWidth(5, 120);  // نوع الطلب
      sheet.setColumnWidth(6, 200);  // العنوان
      sheet.setColumnWidth(7, 400);  // الأصناف
      sheet.setColumnWidth(8, 130);  // الإجمالي
      sheet.setColumnWidth(9, 200);  // ملاحظات
      sheet.setColumnWidth(10, 130); // الحالة
      
      // تجميد الصف الأول
      sheet.setFrozenRows(1);
    }
    
    // قراءة بيانات الطلب
    var data = JSON.parse(e.postData.contents);
    
    var row = [
      data.orderId || "",
      data.orderDate || new Date().toLocaleString("ar-EG"),
      data.name || "",
      data.phone || "",
      data.orderType || "",
      data.address || "",
      data.items || "",
      data.total || 0,
      data.notes || "",
      "🟡 قيد التجهيز"
    ];
    
    sheet.appendRow(row);
    
    // تنسيق الصف الجديد
    var lastRow = sheet.getLastRow();
    var rowRange = sheet.getRange(lastRow, 1, 1, 10);
    rowRange.setHorizontalAlignment("right");
    rowRange.setVerticalAlignment("middle");
    sheet.setRowHeight(lastRow, 35);
    
    // تلوين حالة الطلب
    sheet.getRange(lastRow, 10).setBackground("#fff3cd").setFontColor("#856404");
    
    // تلوين صفوف بالتناوب
    if (lastRow % 2 === 0) {
      rowRange.setBackground("#f8f9fa");
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "مطعم الهندي - نظام الطلبات يعمل بنجاح ✅" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// دالة لتحديث حالة الطلب (يمكن استخدامها يدوياً من الشيت)
function updateOrderStatus(orderId, newStatus) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("الطلبات");
  if (!sheet) return;
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      sheet.getRange(i + 1, 10).setValue(newStatus);
      
      // تحديث اللون حسب الحالة
      var statusCell = sheet.getRange(i + 1, 10);
      if (newStatus.includes("تجهيز")) {
        statusCell.setBackground("#fff3cd").setFontColor("#856404");
      } else if (newStatus.includes("تم")) {
        statusCell.setBackground("#d1edff").setFontColor("#004085");
      } else if (newStatus.includes("ملغي")) {
        statusCell.setBackground("#f8d7da").setFontColor("#721c24");
      }
      break;
    }
  }
}
