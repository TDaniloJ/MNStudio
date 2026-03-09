import React from "react";
import ErrorLayout from "../../components/layout/ErrorLayout";

const ServerError = () => {
  return (
    <ErrorLayout
      code="500"
      title="Erro interno"
      message="Deu ruim aqui do nosso lado 😅 Tenta novamente em alguns segundos."
      showBackButton={true}
      showHomeButton={true}
    />
  );
};

export default ServerError;
