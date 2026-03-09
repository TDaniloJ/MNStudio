import React from "react";
import ErrorLayout from "../../components/layout/ErrorLayout";

const Forbidden = () => {
  return (
    <ErrorLayout
      code="403"
      title="Acesso negado"
      message="Você não tem permissão pra acessar essa página."
    />
  );
};

export default Forbidden;