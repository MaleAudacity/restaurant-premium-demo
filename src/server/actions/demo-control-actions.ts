"use server";

import { revalidatePath } from "next/cache";

import {
  completeBooking,
  confirmBooking,
  createSampleBookingRequest,
  createSampleEventInquiry,
  markEventConfirmed,
  markEventContacted,
  markEventQuoted,
  markOrderApproved,
  markOrderDelivered,
  markOrderPreparing,
  markOrderReady,
  resetPrimaryDemoChat,
  simulatePaymentFailure,
  simulatePaymentSuccess,
  startNewPrimaryDemoChat,
} from "@/lib/demo/chat-actions";

function refreshDemoSurfaces() {
  revalidatePath("/demo/chat");
  revalidatePath("/demo/control");
  revalidatePath("/orders");
  revalidatePath("/bookings");
  revalidatePath("/events");
  revalidatePath("/dashboard");
}

function readOptionalId(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value ? value : undefined;
}

export async function resetCurrentConversationAction(formData: FormData) {
  await resetPrimaryDemoChat(readOptionalId(formData, "conversationId"));
  refreshDemoSurfaces();
}

export async function startNewConversationAction() {
  await startNewPrimaryDemoChat();
  refreshDemoSurfaces();
}

export async function simulatePaymentSuccessControlAction(formData: FormData) {
  await simulatePaymentSuccess(readOptionalId(formData, "orderId"));
  refreshDemoSurfaces();
}

export async function simulatePaymentFailureControlAction(formData: FormData) {
  await simulatePaymentFailure(readOptionalId(formData, "orderId"));
  refreshDemoSurfaces();
}

export async function approveOrderControlAction(formData: FormData) {
  await markOrderApproved(readOptionalId(formData, "orderId"));
  refreshDemoSurfaces();
}

export async function markPreparingControlAction(formData: FormData) {
  await markOrderPreparing(readOptionalId(formData, "orderId"));
  refreshDemoSurfaces();
}

export async function markReadyControlAction(formData: FormData) {
  await markOrderReady(readOptionalId(formData, "orderId"));
  refreshDemoSurfaces();
}

export async function markDeliveredControlAction(formData: FormData) {
  await markOrderDelivered(readOptionalId(formData, "orderId"));
  refreshDemoSurfaces();
}

export async function createSampleBookingControlAction() {
  await createSampleBookingRequest();
  refreshDemoSurfaces();
}

export async function confirmBookingControlAction(formData: FormData) {
  await confirmBooking(readOptionalId(formData, "bookingId"));
  refreshDemoSurfaces();
}

export async function completeBookingControlAction(formData: FormData) {
  await completeBooking(readOptionalId(formData, "bookingId"));
  refreshDemoSurfaces();
}

export async function createSampleEventControlAction() {
  await createSampleEventInquiry();
  refreshDemoSurfaces();
}

export async function contactEventControlAction(formData: FormData) {
  await markEventContacted(readOptionalId(formData, "eventId"));
  refreshDemoSurfaces();
}

export async function quoteEventControlAction(formData: FormData) {
  await markEventQuoted(readOptionalId(formData, "eventId"));
  refreshDemoSurfaces();
}

export async function confirmEventControlAction(formData: FormData) {
  await markEventConfirmed(readOptionalId(formData, "eventId"));
  refreshDemoSurfaces();
}
