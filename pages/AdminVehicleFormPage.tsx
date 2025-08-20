import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVehicleData } from "../hooks/useVehicleData.tsx";
import { Vehicle } from "../types.ts";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth.tsx";
import { motion } from "framer-motion";

const carMakes = [
  "Fiat",
  "Volkswagen",
  "Chevrolet",
  "Toyota",
  "Hyundai",
  "Renault",
  "Jeep",
  "Honda",
  "BYD",
  "Nissan",
  "Caoa Chery",
  "Ford",
  "Citroën",
  "GWM",
  "RAM",
  "Mitsubishi",
  "Peugeot",
  "BMW",
  "Mercedes-Benz",
  "Volvo",
];

const AdminVehicleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVehicleById, addVehicle, updateVehicle } = useVehicleData();
  const { token } = useAuth();
  const isEditing = Boolean(id);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [vehicle, setVehicle] = useState<
    Omit<Vehicle, "id" | "price" | "year" | "km" | "doors"> & {
      price: string;
      year: string;
      km: string;
      doors: string;
    }
  >({
    name: "",
    price: "",
    make: "",
    model: "",
    year: new Date().getFullYear().toString(),
    km: "",
    color: "",
    gearbox: "Manual",
    fuel: "Flex",
    doors: "4",
    additionalInfo: "",
    optionals: [],
    images: [],
    views: 0,
  });

  useEffect(() => {
    if (isEditing && id) {
      (async () => {
        const existingVehicle = await getVehicleById(id);
        if (existingVehicle) {
          setVehicle({
            ...existingVehicle,
            price: existingVehicle.price.toString(),
            year: existingVehicle.year.toString(),
            km: existingVehicle.km.toString(),
            doors: existingVehicle.doors.toString(),
          });
        }
      })();
    }
  }, [id, isEditing, getVehicleById]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: "optionals") => {
    const values = e.target.value.split(",").map((item) => item.trim());
    setVehicle((prev) => ({ ...prev, [field]: values }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("vehicleName", vehicle.name || "new-vehicle");

    setIsUploading(true);
    setUploadError("");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha no upload da imagem.");
      }

      const newImagePaths = await response.json();
      setVehicle((prev) => ({
        ...prev,
        images: [...prev.images, ...newImagePaths],
      }));
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    const confirmed =
      window && typeof window !== "undefined"
        ? window.confirm("Tem certeza que deseja remover esta imagem?")
        : true;
    if (!confirmed) return;

    // Optimistically update UI
    setVehicle((prev) => ({
      ...prev,
      images: prev.images.filter((url) => url !== imageUrl),
    }));

    // Persist deletion on backend and filesystem if editing existing vehicle
    try {
      if (isEditing && id) {
        await fetch(`/api/vehicles/${id}/images`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ path: imageUrl }),
        });
      }
    } catch (e) {
      // Non-blocking; UI already updated
      console.warn("Falha ao remover imagem no servidor", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicle.images.length === 0) {
      console.warn("Validação: pelo menos uma imagem é necessária.");
      return;
    }
    if (vehicle.make === "") {
      console.warn("Validação: marca é obrigatória.");
      return;
    }
    const vehicleDataToSubmit = {
      ...vehicle,
      price: Number(vehicle.price) || 0,
      year: Number(vehicle.year) || 0,
      km: Number(vehicle.km) || 0,
      doors: Number(vehicle.doors) || 0,
    };

    try {
      if (isEditing && id) {
        await updateVehicle({ ...vehicleDataToSubmit, id });
      } else {
        await addVehicle(vehicleDataToSubmit);
      }
      navigate("/admin/vehicles");
    } catch (error) {
      console.error("Failed to save vehicle", error);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!id) return;

    const confirmed =
      window && typeof window !== "undefined"
        ? window.confirm(
            "Tem certeza que deseja deletar este veículo? Esta ação não pode ser desfeita."
          )
        : true;
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar veículo");
      }

      navigate("/admin/vehicles");
    } catch (error) {
      console.error("Failed to delete vehicle", error);
    }
  };

  const inputStyles =
    "w-full rounded-lg border border-gray-300 bg-gray-50 py-3 px-5 font-medium outline-none transition focus:border-blue-500 focus:bg-white shadow-sm";
  const labelStyles = "mb-2.5 block font-medium text-gray-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          {isEditing ? "✏️ Editar Veículo" : "🚗 Adicionar Novo Veículo"}
        </h2>
      </motion.div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos principais */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                { label: "Nome", name: "name", type: "text", required: true },
                {
                  label: "Preço",
                  name: "price",
                  type: "number",
                  required: true,
                },
                {
                  label: "Marca",
                  name: "make",
                  type: "select",
                  options: carMakes,
                  required: true,
                },
                {
                  label: "Modelo",
                  name: "model",
                  type: "text",
                  required: true,
                },
                { label: "Ano", name: "year", type: "number", required: true },
                {
                  label: "Quilometragem (km)",
                  name: "km",
                  type: "number",
                  required: true,
                },
                { label: "Cor", name: "color", type: "text" },
                { label: "Portas", name: "doors", type: "number" },
              ].map((field) => (
                <div key={field.name}>
                  <label className={labelStyles}>{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={(vehicle as any)[field.name]}
                      onChange={handleChange}
                      className={inputStyles}
                      required={field.required}
                    >
                      <option value="" disabled>
                        Selecione uma marca
                      </option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={(vehicle as any)[field.name]}
                      onChange={handleChange}
                      className={inputStyles}
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              {/* Câmbio */}
              <div>
                <label className={labelStyles}>Câmbio</label>
                <select
                  name="gearbox"
                  value={vehicle.gearbox}
                  onChange={handleChange}
                  className={inputStyles}
                >
                  <option>Manual</option>
                  <option>Automático</option>
                </select>
              </div>

              {/* Combustível */}
              <div>
                <label className={labelStyles}>Combustível</label>
                <select
                  name="fuel"
                  value={vehicle.fuel}
                  onChange={handleChange}
                  className={inputStyles}
                >
                  <option>Gasolina</option>
                  <option>Etanol</option>
                  <option>Flex</option>
                  <option>Diesel</option>
                  <option>Elétrico</option>
                  <option>Híbrido</option>
                </select>
              </div>
            </div>

            {/* Upload de imagens */}
            <div>
              <label className={labelStyles}>Imagens</label>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 transition">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-4">
                  {vehicle.images.map((imageUrl) => (
                    <motion.div
                      key={imageUrl}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(imageUrl)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-800"
                  >
                    <span>Selecione as imagens</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/jpeg, image/png, image/webp"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="text-xs text-gray-500">ou arraste e solte</p>
                </div>
                {isUploading ? (
                  <p className="text-sm text-gray-600 mt-2">Enviando imagens...</p>
                ) : null}
                {uploadError ? <p className="text-sm text-red-500 mt-2">{uploadError}</p> : null}
              </div>
              <p className="mt-1 text-xs text-gray-500">A primeira imagem será a capa.</p>
            </div>

            {/* Textos adicionais */}
            <div>
              <label className={labelStyles}>Informações Adicionais</label>
              <textarea
                name="additionalInfo"
                value={vehicle.additionalInfo}
                onChange={handleChange}
                rows={4}
                className={inputStyles}
              ></textarea>
            </div>
            <div>
              <label className={labelStyles}>Opcionais (separados por vírgula)</label>
              <textarea
                name="optionals"
                value={vehicle.optionals.join(", ")}
                onChange={(e) => handleArrayChange(e, "optionals")}
                rows={4}
                className={inputStyles}
              ></textarea>
            </div>

            {/* Botões de ação premium */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
              {/* Cancelar */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-gray-400 to-gray-600 py-3 px-6 font-medium text-white shadow-lg hover:from-gray-500 hover:to-gray-700 transition-all duration-300"
              >
                Cancelar
              </motion.button>

              {/* Deletar */}
              {isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleDeleteVehicle()}
                  className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-red-500 to-red-700 py-3 px-6 font-medium text-white shadow-lg hover:from-red-600 hover:to-red-800 transition-all duration-300 flex items-center justify-center"
                >
                  <FiTrash2 className="inline mr-2" />
                  Deletar Veículo
                </motion.button>
              ) : null}

              {/* Adicionar / Atualizar */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isUploading}
                className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 py-3 px-6 font-medium text-white shadow-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading
                  ? "Enviando..."
                  : isEditing
                    ? "Atualizar Veículo"
                    : "Adicionar Veículo"}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminVehicleFormPage;
