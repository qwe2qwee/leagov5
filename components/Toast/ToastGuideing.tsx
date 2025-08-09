// // ==========================================
// // 📚 دليل استخدام نظام التوست الشامل
// // ==========================================

// // 1️⃣ **الإعداد الأولي - App.tsx**
// import { NavigationContainer } from "@react-navigation/native";
// import React from "react";
// import { ToastContainer } from "./ToastContainer";

// export default function App() {
//   return (
//     <NavigationContainer>
//       {/* مكونات التطبيق الأخرى */}

//       {/* 🚨 مهم: إضافة ToastContainer في النهاية */}
//       <ToastContainer />
//     </NavigationContainer>
//   );
// }

// // ==========================================
// // 2️⃣ **الاستخدام البسيط**
// // ==========================================

// import { useToast } from "@/store/useToastStore";
// import { Text, TouchableOpacity, View } from "react-native";

// const SimpleUsageExample = () => {
//   const toast = useToast();

//   return (
//     <View>
//       {/* نجاح بسيط */}
//       <TouchableOpacity onPress={() => toast.showSuccess("تم الحفظ بنجاح!")}>
//         <Text>حفظ</Text>
//       </TouchableOpacity>

//       {/* خطأ بسيط */}
//       <TouchableOpacity onPress={() => toast.showError("حدث خطأ في الاتصال")}>
//         <Text>اختبار خطأ</Text>
//       </TouchableOpacity>

//       {/* معلومات */}
//       <TouchableOpacity onPress={() => toast.showInfo("تم تحديث البيانات")}>
//         <Text>معلومات</Text>
//       </TouchableOpacity>

//       {/* تحذير */}
//       <TouchableOpacity
//         onPress={() => toast.showWarning("تحقق من الاتصال بالإنترنت")}
//       >
//         <Text>تحذير</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // ==========================================
// // 3️⃣ **الاستخدام المتقدم مع خيارات**
// // ==========================================

// const AdvancedUsageExample = () => {
//   const toast = useToast();

//   // توست طويل المدة
//   const showLongToast = () => {
//     toast.showError("رسالة خطأ مهمة", {
//       duration: 8000, // 8 ثوانِ
//       position: "bottom",
//     });
//   };

//   // توست لا يختفي تلقائياً
//   const showPersistentToast = () => {
//     toast.showWarning("هذه رسالة مهمة جداً", {
//       persistent: true, // لا تختفي تلقائياً
//       position: "top",
//     });
//   };

//   // توست مع زر action
//   const showActionToast = () => {
//     toast.showInfo("هل تريد حذف هذا العنصر؟", {
//       action: {
//         label: "حذف",
//         onPress: () => {
//           console.log("تم الحذف!");
//           // تنفيذ عملية الحذف هنا
//         },
//       },
//       persistent: true, // لا يختفي حتى يضغط المستخدم
//     });
//   };

//   return (
//     <View>
//       <TouchableOpacity onPress={showLongToast}>
//         <Text>توست طويل المدة</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={showPersistentToast}>
//         <Text>توست دائم</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={showActionToast}>
//         <Text>توست مع زر</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // ==========================================
// // 4️⃣ **حالات استخدام في العمليات الفعلية**
// // ==========================================

// // 🔐 **في عمليات تسجيل الدخول**
// const LoginExample = () => {
//   const toast = useToast();

//   const handleLogin = async (email: string, password: string) => {
//     try {
//       const result = await loginAPI(email, password);

//       if (result.success) {
//         toast.showSuccess("مرحباً بك! تم تسجيل الدخول بنجاح 🎉", {
//           duration: 3000,
//           position: "top",
//         });
//       }
//     } catch (error) {
//       if (error.code === "invalid_credentials") {
//         toast.showError("بيانات الدخول غير صحيحة", {
//           duration: 4000,
//         });
//       } else if (error.code === "network_error") {
//         toast.showWarning("تحقق من الاتصال بالإنترنت", {
//           action: {
//             label: "إعادة المحاولة",
//             onPress: () => handleLogin(email, password),
//           },
//           persistent: true,
//         });
//       } else {
//         toast.showError("حدث خطأ غير متوقع", {
//           duration: 5000,
//         });
//       }
//     }
//   };
// };

// // 💾 **في عمليات الحفظ**
// const SaveDataExample = () => {
//   const toast = useToast();

//   const saveUserData = async (userData: any) => {
//     try {
//       // إظهار توست أثناء الحفظ
//       const savingToastId = toast.addToast({
//         message: "جار الحفظ...",
//         type: "info",
//         persistent: true,
//       });

//       await saveAPI(userData);

//       // إزالة توست الحفظ
//       toast.removeToast(savingToastId);

//       // إظهار توست النجاح
//       toast.showSuccess("تم حفظ البيانات بنجاح ✓", {
//         duration: 2500,
//       });
//     } catch (error) {
//       toast.showError("فشل في حفظ البيانات", {
//         action: {
//           label: "إعادة المحاولة",
//           onPress: () => saveUserData(userData),
//         },
//         persistent: true,
//       });
//     }
//   };
// };

// // 🗑️ **في عمليات الحذف مع التأكيد**
// const DeleteExample = () => {
//   const toast = useToast();

//   const confirmDelete = (itemId: string, itemName: string) => {
//     toast.showWarning(`هل تريد حذف "${itemName}"؟`, {
//       action: {
//         label: "حذف",
//         onPress: async () => {
//           try {
//             await deleteAPI(itemId);
//             toast.showSuccess("تم الحذف بنجاح", {
//               duration: 2000,
//             });
//           } catch (error) {
//             toast.showError("فشل في الحذف");
//           }
//         },
//       },
//       persistent: true,
//     });
//   };
// };

// // 📡 **في حالة انقطاع الاتصال**
// const NetworkStatusExample = () => {
//   const toast = useToast();
//   let offlineToastId: string | null = null;

//   const handleNetworkChange = (isConnected: boolean) => {
//     if (!isConnected) {
//       // إظهار توست عدم الاتصال
//       offlineToastId = toast.addToast({
//         message: "لا يوجد اتصال بالإنترنت",
//         type: "warning",
//         persistent: true,
//         position: "bottom",
//       });
//     } else if (offlineToastId) {
//       // إزالة توست عدم الاتصال
//       toast.removeToast(offlineToastId);
//       // إظهار توست العودة للاتصال
//       toast.showSuccess("تم استعادة الاتصال", {
//         duration: 2000,
//       });
//       offlineToastId = null;
//     }
//   };
// };

// // ==========================================
// // 5️⃣ **إدارة متقدمة للتوستات**
// // ==========================================

// const AdvancedManagementExample = () => {
//   const toast = useToast();

//   // مسح جميع التوستات
//   const clearAllToasts = () => {
//     toast.clearAll();
//   };

//   // إظهار عدة توستات
//   const showMultipleToasts = () => {
//     toast.showInfo("الرسالة الأولى");

//     setTimeout(() => {
//       toast.showSuccess("الرسالة الثانية");
//     }, 1000);

//     setTimeout(() => {
//       toast.showWarning("الرسالة الثالثة");
//     }, 2000);
//   };

//   // توست مخصص بالكامل
//   const showCustomToast = () => {
//     const toastId = toast.addToast({
//       message: "رسالة مخصصة",
//       type: "info",
//       duration: 5000,
//       position: "bottom",
//       action: {
//         label: "تخصيص",
//         onPress: () => {
//           // تحديث التوست
//           toast.updateToast(toastId, {
//             message: "تم التحديث!",
//             type: "success",
//           });
//         },
//       },
//     });
//   };

//   return (
//     <View>
//       <TouchableOpacity onPress={clearAllToasts}>
//         <Text>مسح جميع التوستات</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={showMultipleToasts}>
//         <Text>عرض عدة توستات</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={showCustomToast}>
//         <Text>توست مخصص</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // ==========================================
// // 6️⃣ **أمثلة لحالات مختلفة**
// // ==========================================

// // 📱 **في تطبيق التجارة الإلكترونية**
// const ECommerceExamples = () => {
//   const toast = useToast();

//   // إضافة للسلة
//   const addToCart = (productName: string) => {
//     toast.showSuccess(`تم إضافة ${productName} للسلة 🛒`, {
//       duration: 2000,
//       action: {
//         label: "عرض السلة",
//         onPress: () => {
//           // انتقال لصفحة السلة
//         },
//       },
//     });
//   };

//   // فشل الدفع
//   const paymentFailed = () => {
//     toast.showError("فشلت عملية الدفع", {
//       action: {
//         label: "إعادة المحاولة",
//         onPress: () => {
//           // إعادة محاولة الدفع
//         },
//       },
//       persistent: true,
//     });
//   };

//   // نجاح الطلب
//   const orderSuccess = (orderNumber: string) => {
//     toast.showSuccess(`تم تأكيد طلبك #${orderNumber} 🎉`, {
//       duration: 5000,
//       action: {
//         label: "تتبع الطلب",
//         onPress: () => {
//           // انتقال لصفحة التتبع
//         },
//       },
//     });
//   };
// };

// // 📋 **في تطبيق إدارة المهام**
// const TaskManagerExamples = () => {
//   const toast = useToast();

//   // إنجاز مهمة
//   const completeTask = (taskTitle: string) => {
//     toast.showSuccess(`✓ تم إنجاز: ${taskTitle}`, {
//       duration: 3000,
//     });
//   };

//   // تذكير بمهمة
//   const taskReminder = (taskTitle: string, dueTime: string) => {
//     toast.showWarning(`⏰ تذكير: ${taskTitle}`, {
//       action: {
//         label: "عرض المهمة",
//         onPress: () => {
//           // فتح تفاصيل المهمة
//         },
//       },
//       persistent: true,
//       position: "bottom",
//     });
//   };
// };

// // ==========================================
// // 7️⃣ **نصائح للاستخدام الأمثل**
// // ==========================================

// /*
// 🎯 **أفضل الممارسات:**

// 1. **المدة المناسبة:**
//    - النجاح: 2-3 ثوانِ
//    - الأخطاء: 4-5 ثوانِ
//    - التحذيرات: 3-4 ثوانِ
//    - المعلومات: 2-3 ثوانِ

// 2. **متى تستخدم persistent:**
//    - رسائل تحتاج تأكيد من المستخدم
//    - أخطاء مهمة
//    - رسائل مع أزرار actions

// 3. **الموضع:**
//    - top: للرسائل العامة
//    - bottom: للرسائل المتعلقة بالعمليات

// 4. **الرسائل:**
//    - واضحة ومختصرة
//    - باللغة المناسبة للمستخدم
//    - مع emojis للوضوح البصري

// 5. **إدارة التوستات:**
//    - تجنب عرض الكثير في نفس الوقت
//    - استخدم clearAll() عند الحاجة
//    - امنح كل توست ID فريد للتحكم الدقيق
// */

// export {
//   AdvancedManagementExample,
//   AdvancedUsageExample,
//   DeleteExample,
//   ECommerceExamples,
//   LoginExample,
//   NetworkStatusExample,
//   SaveDataExample,
//   SimpleUsageExample,
//   TaskManagerExamples,
// };
