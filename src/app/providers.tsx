"use client";

import React from "react";
import { Provider } from "react-redux";
import { makeStore } from "../lib/store";
import { PersistGate } from "redux-persist/integration/react";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ActivityProvider } from "@/lib/context/ActivityContext";
import CartSync from "@/components/cart/CartSync";
import SpinnerbLoader from "@/components/ui/SpinnerbLoader";

type Props = {
  children: React.ReactNode;
};

// Provider component to wrap whole app with Redux store, auth context, and activity context
const Providers = ({ children }: Props) => {
  const [{ store, persistor }] = React.useState(() => makeStore());

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center h-96">
            <SpinnerbLoader className="w-10 border-2 border-gray-300 border-r-gray-600" />
          </div>
        }
        persistor={persistor}
      >
        <AuthProvider>
          <ActivityProvider>
            <CartSync />
            {children}
          </ActivityProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
};

export default Providers;
