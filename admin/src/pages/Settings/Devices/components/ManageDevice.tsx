import type React from "react";
import { useState } from "react";
import type { DeviceIn, DeviceOut, DeviceType } from "../../../../interfaces/device.interface";

const DEVICE_TYPE_OPTIONS: DeviceType[] = ["Desktop"];

interface ManageDeviceProps {
    device?: DeviceOut | null;
    onSave: (data: DeviceIn) => Promise<void>;
    onCancel: () => void;
}

const ManageDevice: React.FC<ManageDeviceProps> = ({
    device = null,
    onSave,
    onCancel,
}) => {
    const isEditing = device !== null;

    const [name, setName] = useState(device?.name ?? "");
    const [description, setDescription] = useState(device?.description ?? "");
    const [deviceType, setDeviceType] = useState<DeviceType>(
        (device?.device_type as DeviceType) ?? "Desktop"
    );
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload: DeviceIn = {
                name: name.trim(),
                description: description.trim() || null,
                device_type: deviceType,
            };
            await onSave(payload);
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
                {isEditing ? "Update Device" : "Add Device"}
            </h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="input-group">
                    <label className="input-label" htmlFor="device-name">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="device-name"
                        type="text"
                        className="input"
                        placeholder="Enter device name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="device-description">
                        Description
                    </label>
                    <textarea
                        id="device-description"
                        className="input resize-none"
                        rows={3}
                        placeholder="Enter device description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="device-type">
                        Device Type
                    </label>
                    <select
                        id="device-type"
                        className="input"
                        value={deviceType}
                        onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                    >
                        {DEVICE_TYPE_OPTIONS.map((dt) => (
                            <option key={dt} value={dt}>
                                {dt}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving || !name.trim()}
                    >
                        {isSaving
                            ? isEditing ? "Updating…" : "Saving…"
                            : isEditing ? "Update Device" : "Add Device"}
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

export default ManageDevice;
