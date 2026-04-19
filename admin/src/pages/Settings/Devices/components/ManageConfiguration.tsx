import type React from "react";
import { useState } from "react";
import type { DeviceDataType } from "../../../../interfaces/device.interface";

const DATA_TYPE_OPTIONS: DeviceDataType[] = ["user_access", "cpu_and_memory_usage", "io_device_usage"];

interface ManageConfigurationProps {
    onSave: (dataType: DeviceDataType) => Promise<void>;
    onCancel: () => void;
}

const ManageConfiguration: React.FC<ManageConfigurationProps> = ({
    onSave,
    onCancel,
}) => {
    const [dataType, setDataType] = useState<DeviceDataType>("user_access");
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(dataType);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="card">
            <h4
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
            >
                Add Configuration
            </h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="input-group">
                    <label className="input-label" htmlFor="config-data-type">
                        Data Type
                    </label>
                    <select
                        id="config-data-type"
                        className="input"
                        value={dataType}
                        onChange={(e) => setDataType(e.target.value as DeviceDataType)}
                    >
                        {DATA_TYPE_OPTIONS.map((dt) => (
                            <option key={dt} value={dt}>
                                {dt.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving…" : "Add Configuration"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManageConfiguration;