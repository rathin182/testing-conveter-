"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import PayoutHistory from "./PayoutHistory";
import PaymentModal from "./payout/PayoutModal";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

type User = {
  id: string;
  name: string;
  role: "CLIENT" | "ENGINEER";
  payoutDetail: any;
};

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <p
        className="text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </p>

      <h2
        className="text-xl font-bold mt-1"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </h2>
    </div>
  );
}

export default function PayoutAdmin({
  projectId,
}: {
  projectId: string;
}) {
  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingTx, setEditingTx] =
    useState<any>(null);

  const { data, mutate } = useSWR(
    `/api/payout/${projectId}`,
    fetcher
  );

  const stats = data?.stats ?? {};
  const users = stats?.users ?? [];
  const transactions = data?.transactions ?? [];

  const totalAmount = stats?.budget ?? 0;
  const receivedAmount = stats?.totalReceived ?? 0;

  // SEPARATE USERS
  const clientUsers = users.filter(
    (u: any) => u.role === "CLIENT"
  );

  const engineerUsers = users.filter(
    (u: any) => u.role === "ENGINEER"
  );

  const isClientSelected =
    selectedUser?.role === "CLIENT";

  const isEngineerSelected =
    selectedUser?.role === "ENGINEER";

  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      const client = users.find(
        (u: any) => u.role === "CLIENT"
      );

      setSelectedUser(client || users[0]);
    }
  }, [users, selectedUser]);

  const userTransactions = transactions.filter(
    (t: any) => t.userId === selectedUser?.id
  );

  // ENGINEER PAYOUTS
  const engineerTransactions =
    userTransactions.filter(
      (t: any) =>
        t.type === "PAYOUT_ENGINEER"
    );

  const engineerBudget = stats?.engineerBudget ?? 0;
  const engineerPaid = stats?.engineerPaid ?? 0;
  const engineerPending = stats?.engineerPending ?? 0;

  const pendingTx = userTransactions.find(
    (t: any) =>
      t.status === "PENDING" &&
      (t.type === "PAYOUT_ENGINEER" ||
        t.type === "REFUND_CLIENT")
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-black">

      {/* SIDEBAR */}
      <div className="flex flex-col gap-6">

        {/* CLIENT USERS */}
        <div className="w-full lg:w-72 border border-[var(--border)] rounded-xl bg-white p-5 space-y-4 h-fit">

          <h3 className="font-semibold text-lg text-[var(--text-primary)]">
            Client
          </h3>

          <div className="space-y-3">
            {clientUsers.map((user: any) => (
              <button
                key={user.id}
                onClick={() =>
                  setSelectedUser(user)
                }
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between
                ${
                  selectedUser?.id === user?.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
                    : "border-[var(--border)] hover:bg-[var(--bg)]"
                }`}
              >
                <div>
                  <p className="font-bold text-sm text-[var(--text-primary)]">
                    {user.name}
                  </p>

                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {user.role}
                  </p>
                </div>

                <Clock
                  size={16}
                  className="text-[var(--text-muted)]"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ENGINEER USERS */}
        <div className="w-full lg:w-72 border border-[var(--border)] rounded-xl bg-white p-5 space-y-4 h-fit">

          <h3 className="font-semibold text-lg text-[var(--text-primary)]">
            Engineer
          </h3>

          <div className="space-y-3">
            {engineerUsers.map((user: any) => (
              <button
                key={user.id}
                onClick={() =>
                  setSelectedUser(user)
                }
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between
                ${
                  selectedUser?.id === user?.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
                    : "border-[var(--border)] hover:bg-[var(--bg)]"
                }`}
              >
                <div>
                  <p className="font-bold text-sm text-[var(--text-primary)]">
                    {user.name}
                  </p>

                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {user.role}
                  </p>
                </div>

                <Clock
                  size={16}
                  className="text-[var(--text-muted)]"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 space-y-6">

        {/* SUMMARY */}
        <div className="grid md:grid-cols-3 gap-4">

          {isClientSelected ? (
            <>
              <SummaryCard
                title="Total Project Amount"
                value={`₹${totalAmount.toLocaleString()}`}
              />

              <SummaryCard
                title="Total Received"
                value={`₹${receivedAmount.toLocaleString()}`}
              />
            </>
          ) : (
            <>
             <SummaryCard
                title="Total Engineer Payout"
                value={`₹${engineerBudget.toLocaleString()}`}
              />

              <SummaryCard
                title="Pending Engineer Amount"
                value={`₹${engineerPending.toLocaleString()}`}
              />
            </>
          )}

          {/* BANK DETAILS */}
          <SummaryCard
            title={`${
              selectedUser?.role === "CLIENT"
                ? "Client"
                : "Engineer"
            } Bank Details`}
            value={
              selectedUser ? (
                selectedUser.payoutDetail ? (
                  <div className="text-xs space-y-1.5 mt-2 text-[var(--text-secondary)]">

                    {selectedUser.payoutDetail.accountHolder && (
                      <p>
                        <span className="font-semibold text-[var(--text-primary)]">
                          Name:
                        </span>{" "}
                        {
                          selectedUser
                            .payoutDetail
                            .accountHolder
                        }
                      </p>
                    )}

                    {selectedUser.payoutDetail.bankName && (
                      <p>
                        <span className="font-semibold text-[var(--text-primary)]">
                          Bank:
                        </span>{" "}
                        {
                          selectedUser
                            .payoutDetail.bankName
                        }
                      </p>
                    )}

                    {selectedUser.payoutDetail.accountNumber && (
                      <p>
                        <span className="font-semibold text-[var(--text-primary)]">
                          A/C:
                        </span>{" "}
                        {
                          selectedUser
                            .payoutDetail
                            .accountNumber
                        }
                      </p>
                    )}

                    {selectedUser.payoutDetail.ifscCode && (
                      <p>
                        <span className="font-semibold text-[var(--text-primary)]">
                          IFSC:
                        </span>{" "}
                        {
                          selectedUser
                            .payoutDetail.ifscCode
                        }
                      </p>
                    )}

                    {selectedUser.payoutDetail.upiId && (
                      <p>
                        <span className="font-semibold text-blue-600">
                          UPI:
                        </span>{" "}
                        <span className="font-medium text-blue-600">
                          {
                            selectedUser
                              .payoutDetail.upiId
                          }
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm font-normal text-[var(--text-muted)]">
                    Not added
                  </span>
                )
              ) : (
                <span className="text-sm font-normal text-[var(--text-muted)]">
                  Select User
                </span>
              )
            }
          />
        </div>

        {/* CONTENT */}
        <div className="flex flex-col lg:flex-row gap-4">

          {/* HISTORY */}
          <div className="flex-1">
            <PayoutHistory
              transactions={userTransactions}
              onEdit={(tx) => {
                setEditingTx(tx);
                setIsModalOpen(true);
              }}
              onMutate={() => mutate()}
            />
          </div>

          {/* ENGINEER ONLY ACTIONS */}
          {isEngineerSelected && (
            <div className="rounded-xl w-full lg:w-80 border border-[var(--border)] bg-white p-6 flex flex-col justify-between h-fit">

              <div>
                <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
                  Pending Action
                </h3>

                {!selectedUser ? (
                  <p className="text-sm text-[var(--text-muted)]">
                    Select a user to proceed.
                  </p>
                ) : pendingTx ? (
                  <>
                    <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">

                      There is a pending{" "}

                      <span className="font-bold text-[var(--text-primary)]">
                        {pendingTx.type ===
                        "REFUND_CLIENT"
                          ? "refund"
                          : "payout"}
                      </span>{" "}

                      of{" "}

                      <span className="font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-0.5">
                        ₹{pendingTx.amount}
                      </span>.
                    </p>

                    <button
                      onClick={() => {
                        setEditingTx(
                          pendingTx
                        );

                        setIsModalOpen(
                          true
                        );
                      }}
                      className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-colors shadow-md"
                      style={{
                        background:
                          "var(--primary)",
                      }}
                    >
                      Process Payment
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-[var(--text-muted)] bg-[var(--bg)] p-4 rounded-lg border border-[var(--border)] text-center">
                    No pending payments for
                    this engineer.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }}
        transaction={editingTx}
        onSuccess={() => mutate()}
      />
    </div>
  );
}