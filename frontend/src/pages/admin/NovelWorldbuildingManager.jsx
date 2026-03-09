import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import WorldbuildingPanel from "../../components/admin/WorldbuildingPanel";
import { ArrowLeft } from "lucide-react";

const NovelWorldbuildingManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Worldbuilding da Novel
        </h1>

        <div />
      </div>

      <WorldbuildingPanel novelId={id} mode="manage" />
    </div>
  );
};

export default NovelWorldbuildingManager;
