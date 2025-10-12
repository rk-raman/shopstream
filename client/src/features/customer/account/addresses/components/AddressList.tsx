"use client";

import React from "react";
import AddressCard from "./AddressCard";
import type { Address } from "../types";

interface AddressListProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export default function AddressList({
  addresses,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
        />
      ))}
    </div>
  );
}
