"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Lock,
  User,
  Save,
  X,
  Shield,
  Calendar,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/lib/store/store";
import { AddInProfile, Address } from "@/lib/store/auth/authSlice";
import { updateProfileThunk } from "@/lib/store/auth/authThunks";

export default function AccountPageClient() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // State management
  const [activeTab, setActiveTab] = useState<
    "profile" | "addresses" | "security"
  >("profile");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  });

  const [addressForm, setAddressForm] = useState<AddInProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    label: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const dispatch = useDispatch<AppDispatch>();

  // Same regions as checkout
  const countries = ["India", "US", "UK", "Canada"];

  // Calculate member since date
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  // Address handlers
  const handleAddAddress = async () => {
    try {
      if (
        addressForm.firstName &&
        addressForm.lastName &&
        addressForm.email &&
        addressForm.phone &&
        addressForm.addressLine1 &&
        addressForm.city &&
        addressForm.state &&
        addressForm.zipCode &&
        addressForm.country
      ) {
        const newId = crypto.randomUUID();
        const newAddress = { ...addressForm, id: newId };

        const updatedAddresses = [...(user?.addresses || []), newAddress];

        const updatedData = await dispatch(
          updateProfileThunk({ userData: { addresses: updatedAddresses } }),
        ).unwrap();

        if (updatedData.data) {
          toast.success("Address added successfully");
          resetAddressForm();
          setIsAddingAddress(false);
        } else {
          toast.error(updatedData.message || "Failed to add address");
        }
      } else {
        toast.error("Please fill all required fields");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Something went wrong while adding address");
    }
  };

  const handleUpdateAddress = async () => {
    if (editingAddressId) {
      try {
        const updatedAddress = { ...addressForm, id: editingAddressId };

        const updatedAddresses = (user?.addresses || []).map((addr) =>
          addr.id === editingAddressId ? updatedAddress : addr,
        );

        const updatedData = await dispatch(
          updateProfileThunk({
            userData: { addresses: updatedAddresses },
          }),
        ).unwrap();

        if (updatedData.data) {
          toast.success("Address updated successfully");
          resetAddressForm();
          setEditingAddressId(null);
          setIsAddingAddress(false);
        } else {
          toast.error(updatedData.message || "Failed to update address");
        }
      } catch (error) {
        console.error("Error updating address:", error);
        toast.error("Something went wrong while updating address");
      }
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const updatedAddresses = (user?.addresses || []).filter(
        (addr) => addr.id !== id,
      );

      const updatedData = await dispatch(
        updateProfileThunk({
          userData: { addresses: updatedAddresses },
        }),
      ).unwrap();

      if (updatedData.data) {
        toast.success("Address deleted successfully");
      } else {
        toast.error(updatedData.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Something went wrong while deleting address");
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      label: address.label || "",
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      email: (address as any).email || user?.email || "",
      phone: address.phone || "",
      // migrate old records that still used `street`
      addressLine1:
        (address as any).addressLine1 || (address as any).street || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      country: address.country || "India",
    });
    setEditingAddressId(address.id || null);
    setIsAddingAddress(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      label: "",
    });
  };

  const handleCancelAddress = () => {
    resetAddressForm();
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };

  // Profile handlers
  const handleUpdateProfile = async () => {
    try {
      const updatedData = await dispatch(
        updateProfileThunk({ userData: profileForm }),
      ).unwrap();

      if (updatedData.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(updatedData.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
    setIsEditingProfile(false);
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
    });
    setIsEditingProfile(false);
  };

  // Password handlers
  const handleChangePassword = () => {
    if (passwordForm.newPassword === passwordForm.confirmPassword) {
      // TODO: Call API to change password
      console.log("Changing password");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      alert("Passwords do not match!");
    }
  };

  /* ── Shared style tokens (match checkout / category pages) ── */
  const labelCls =
    "block text-[11px] font-black uppercase tracking-[2px] text-muted mb-2 ml-1";
  const inputCls =
    "w-full h-14 px-6 rounded-xl bg-background border border-border text-foreground outline-none focus:border-secondary transition-all font-semibold";
  const primaryBtnCls =
    "inline-flex items-center gap-2 px-8 h-12 bg-primary text-white text-[13px] font-bold uppercase tracking-wider rounded-full hover:bg-primary/90 transition-all";
  const ghostBtnCls =
    "inline-flex items-center gap-2 px-8 h-12 border border-border text-muted text-[13px] font-bold uppercase tracking-wider rounded-full hover:bg-surface hover:text-foreground transition-all";

  return (
    <div className="pb-24 pt-12 px-[5%] max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[42px] font-bold tracking-tight">My Account</h1>
        <p className="text-muted font-semibold mt-1">
          Manage your profile, addresses and security settings
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 bg-secondary/10 border-2 border-secondary/30 rounded-full flex items-center justify-center shrink-0">
            <User size={28} className="text-secondary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              {user?.first_name} {user?.last_name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                <Calendar size={13} className="text-secondary" />
                Member since {memberSince}
              </span>
              {user?.email && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted truncate">
                  <Mail size={13} className="text-secondary" />
                  {user.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-8">
        {(
          [
            { key: "profile", label: "Profile", icon: User },
            { key: "addresses", label: "Addresses", icon: MapPin },
            { key: "security", label: "Security", icon: Lock },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 h-12 px-6 rounded-full flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-wider transition-all",
              activeTab === tab.key
                ? "bg-secondary text-white shadow-sm"
                : "bg-surface text-muted border border-border hover:text-foreground hover:border-secondary/40",
            )}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-10">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <User size={20} className="text-secondary" />
                Profile Information
              </h3>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-2 px-5 h-10 bg-secondary/10 text-secondary text-xs font-black uppercase tracking-wider rounded-full hover:bg-secondary hover:text-white transition-all"
                >
                  <Edit2 size={13} />
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>First Name</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          first_name: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  ) : (
                    <p className="text-lg font-bold text-foreground ml-1">
                      {user?.first_name || "—"}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Last Name</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          last_name: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  ) : (
                    <p className="text-lg font-bold text-foreground ml-1">
                      {user?.last_name || "—"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls}>Email Address</label>
                <div className="flex items-center gap-2 ml-1">
                  <Mail size={16} className="text-secondary" />
                  <p className="text-lg font-bold text-foreground">
                    {user?.email}
                  </p>
                </div>
                <p className="text-xs font-semibold text-muted mt-1.5 ml-1">
                  Email cannot be changed for security reasons
                </p>
              </div>

              {isEditingProfile && (
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    className={primaryBtnCls}
                  >
                    <Save size={14} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelProfileEdit}
                    className={ghostBtnCls}
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADDRESSES TAB */}
        {activeTab === "addresses" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <MapPin size={20} className="text-secondary" />
                Saved Addresses
              </h3>
              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="inline-flex items-center gap-2 px-5 h-10 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-full hover:bg-primary/90 transition-all"
                >
                  <Plus size={14} />
                  Add Address
                </button>
              )}
            </div>

            {/* Add/Edit Address Form */}
            {isAddingAddress && (
              <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 mb-8">
                <h4 className="text-lg font-bold tracking-tight mb-6">
                  {editingAddressId ? "Edit Address" : "New Address"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label className={labelCls}>First Name *</label>
                    <input
                      type="text"
                      value={addressForm.firstName}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          firstName: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Last Name *</label>
                    <input
                      type="text"
                      value={addressForm.lastName}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          lastName: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Email *</label>
                    <input
                      type="email"
                      value={addressForm.email}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          email: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Phone *</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          phone: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Address Line 1 *</label>
                    <input
                      type="text"
                      value={addressForm.addressLine1}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          addressLine1: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Address Line 2</label>
                    <input
                      type="text"
                      value={addressForm.addressLine2}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          addressLine2: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>City *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          city: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>State *</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          state: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Zip Code *</label>
                    <input
                      type="text"
                      value={addressForm.zipCode}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          zipCode: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Country *</label>
                    <div className="relative">
                      <select
                        value={addressForm.country}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            country: e.target.value,
                          })
                        }
                        className={cn(
                          inputCls,
                          "appearance-none cursor-pointer pr-12",
                        )}
                      >
                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-8">
                  <button
                    onClick={
                      editingAddressId ? handleUpdateAddress : handleAddAddress
                    }
                    className={primaryBtnCls}
                  >
                    <Save size={14} />
                    {editingAddressId ? "Update" : "Save"} Address
                  </button>
                  <button onClick={handleCancelAddress} className={ghostBtnCls}>
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Address List */}
            <div className="space-y-4">
              {user && user.addresses && user.addresses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 mb-5">
                    <MapPin size={32} className="text-secondary" />
                  </div>
                  <h4 className="text-lg font-bold mb-1">
                    No addresses saved yet
                  </h4>
                  <p className="text-sm font-semibold text-muted">
                    Add an address to get started
                  </p>
                </div>
              ) : (
                user &&
                user.addresses &&
                user.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="bg-background border border-border rounded-2xl p-5 sm:p-6 hover:border-secondary/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground">
                          {address.firstName} {address.lastName}
                        </p>
                        <div className="mt-1 space-y-0.5 text-sm font-semibold text-muted">
                          {(address as any).email && (
                            <p>{(address as any).email}</p>
                          )}
                          <p>
                            {(address as any).addressLine1 ||
                              (address as any).street}
                          </p>
                          {address.addressLine2 && (
                            <p>{address.addressLine2}</p>
                          )}
                          <p>
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p>{address.country}</p>
                        </div>
                        <p className="text-sm font-bold text-secondary mt-2">
                          {address.phone}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-secondary hover:border-secondary transition-all"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id!)}
                          className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-red-500 hover:border-red-300 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div>
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-8">
              <Lock size={20} className="text-secondary" />
              Change Password
            </h3>

            <div className="space-y-5 max-w-md">
              <div>
                <label className={labelCls}>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className={inputCls}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className={labelCls}>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className={inputCls}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className={labelCls}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={inputCls}
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={handleChangePassword}
                className={cn(primaryBtnCls, "mt-2")}
              >
                <Lock size={14} />
                Update Password
              </button>

              <div className="mt-8 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <div className="flex gap-3">
                  <Shield
                    size={20}
                    className="text-emerald-600 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-bold text-emerald-900 mb-1.5">
                      Security Tips
                    </p>
                    <ul className="text-xs font-semibold text-emerald-700 space-y-1">
                      <li>• Use at least 8 characters</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Add numbers and special characters</li>
                      <li>• Avoid common words or patterns</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
