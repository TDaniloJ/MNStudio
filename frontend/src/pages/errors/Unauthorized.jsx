import React from "react";
import { Link } from "react-router-dom";
import ErrorLayout from "../../components/layout/ErrorLayout";

const Unauthorized = () => {
  return (
    <ErrorLayout
      code="401"
      title="Você precisa estar logado"
      message="Faz login pra continuar."
      showBackButton={false}
      actions={
        <Link
          to="/login"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium"
        >
          Ir para Login
        </Link>
      }
    />
  );
};

export default Unauthorized;
