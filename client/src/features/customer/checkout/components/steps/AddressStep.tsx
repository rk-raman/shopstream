"use client";

import { useState } from "react";
import { useCheckout } from "../../context/CheckoutContext";
import { MapPin, Plus, Home, Building2 } from "lucide-react";
import type { SavedAddress } from "../../types";

export default function AddressStep() {
  const { session, selectAddress, isLoading } = useCheckout();
  const [selectedId, setSelectedId] = useState<string | null>(
    session?.selectedAddressId || null
  );
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    type: "home" as "home" | "office" | "other",
  });

  if (!session) return null;

  const addresses = session.user.addresses || [];

  const handleSelectSaved = (addressId: string) => {
    setSelectedId(addressId);
    setShowNewForm(false);
  };

  const handleDeliverHere = async () => {
    if (selectedId) {
      await selectAddress({ addressId: selectedId });
    }
  };

  const handleNewAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await selectAddress(newAddress);
    setShowNewForm(false);
  };

  const getAddressIcon = (type?: string) => {
    return type === "office" ? (
      <Building2 className="w-4 h-4" />
    ) : (
      <Home className="w-4 h-4" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Saved Addresses */}
      {addresses.length > 0 && !showNewForm && (
        <div className="space-y-3">
          {addresses.map((addr: SavedAddress) => (
            <label
              key={addr._id}
              className={`flex items-start gap-3 p-4 border rounded cursor-pointer transition-colors ${
                selectedId === addr._id
                  ? "border-[#2874f0] bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleSelectSaved(addr._id)}
            >
              <input
                type="radio"
                name="address"
                checked={selectedId === addr._id}
                onChange={() => handleSelectSaved(addr._id)}
                className="mt-1 accent-[#2874f0]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">
                    {addr.fullName}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {getAddressIcon(addr.type)}
                    {addr.type?.toUpperCase() || "HOME"}
                  </span>
                  <span className="text-sm text-gray-500">{addr.phone}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                </p>
                <p className="text-sm text-gray-600">
                  {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                </p>

                {selectedId === addr._id && (
                  <button
                    onClick={handleDeliverHere}
                    disabled={isLoading}
                    className="mt-3 px-8 py-3 bg-[#fb641b] text-white text-sm font-semibold rounded-sm hover:bg-[#e85d19] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "PROCESSING..." : "DELIVER HERE"}
                  </button>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Add New Address Button */}
      {!showNewForm && (
        <button
          onClick={() => {
            setShowNewForm(true);
            setSelectedId(null);
          }}
          className="w-full flex items-center gap-2 p-4 border border-dashed border-gray-300 rounded text-[#2874f0] font-semibold text-sm hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          ADD A NEW ADDRESS
        </button>
      )}

      {/* New Address Form */}
      {showNewForm && (
        <form onSubmit={handleNewAddressSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-[#2874f0] uppercase">
              Add a new address
            </h4>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newAddress.fullName}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, fullName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2874f0]"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={newAddress.phone}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2874f0]"
                placeholder="10-digit mobile number"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              required
              value={newAddress.addressLine1}
              onChange={(e) =>
                setNewAddress({ ...newAddress, addressLine1: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2874f0]"
              placeholder="House No., Building, Street, Area"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              value={newAddress.addressLine2}
              onChange={(e) =>
                setNewAddress({ ...newAddress, addressLine2: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2874f0]"
              placeholder="Locality, Landmark (optional)"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2874f0]"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2874f0]"
                placeholder="State"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                required
                value={newAddress.pincode}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, pincode: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2874f0]"
                placeholder="6-digit pincode"
              />
            </div>
          </div>

          {/* Address Type */}
          <div className="flex items-center gap-4">
            <label className="block text-xs font-medium text-gray-600">
              Address Type
            </label>
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name="addressType"
                value="home"
                checked={newAddress.type === "home"}
                onChange={() => setNewAddress({ ...newAddress, type: "home" })}
                className="accent-[#2874f0]"
              />
              Home
            </label>
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name="addressType"
                value="office"
                checked={newAddress.type === "office"}
                onChange={() =>
                  setNewAddress({ ...newAddress, type: "office" })
                }
                className="accent-[#2874f0]"
              />
              Work
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-[#fb641b] text-white text-sm font-semibold rounded-sm hover:bg-[#e85d19] transition-colors disabled:opacity-50"
          >
            {isLoading ? "SAVING..." : "SAVE AND DELIVER HERE"}
          </button>
        </form>
      )}

      {/* No addresses at all */}
      {addresses.length === 0 && !showNewForm && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No saved addresses found.</p>
          <p className="text-xs text-gray-400">
            Click the button above to add a new delivery address.
          </p>
        </div>
      )}
    </div>
  );
}
