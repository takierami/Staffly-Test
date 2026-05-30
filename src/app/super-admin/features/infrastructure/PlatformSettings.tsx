import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { Save, AlertCircle, Settings } from "lucide-react";
import { ConfirmActionModal } from "../../components/ConfirmActionModal";

export function PlatformSettings() {
  const [settings, setSettings] = useState<any>({
    maintenance_mode: false,
    global_banner: "",
    feature_flags: {
      enable_new_billing: false,
      beta_analytics: true
    }
  });
  const [originalSettings, setOriginalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .single();

    if (!error && data) {
      setSettings(data);
      setOriginalSettings(data);
    }
    setLoading(false);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("platform_settings")
        .update({
          maintenance_mode: settings.maintenance_mode,
          global_banner: settings.global_banner,
          feature_flags: settings.feature_flags
        })
        .eq('id', settings.id);

      if (error) throw error;
      
      // Log the action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('security_events').insert({
          actor_id: user.id,
          event_type: 'platform_settings_updated',
          severity: settings.maintenance_mode !== originalSettings.maintenance_mode ? 'high' : 'medium',
          metadata: { 
            changed_from: originalSettings,
            changed_to: settings 
          }
        });
      }

      setOriginalSettings(settings);
    } catch (error) {
      console.error(error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
      setIsConfirmOpen(false);
    }
  };

  const attemptSave = () => {
    if (settings.maintenance_mode !== originalSettings.maintenance_mode && settings.maintenance_mode === true) {
      setIsConfirmOpen(true);
    } else {
      handleSave();
    }
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-slate-800 rounded-xl w-full max-w-3xl"></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <Settings className="mr-2" /> Platform Settings
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage global infrastructure configurations and feature flags.</p>
        </div>
        
        <button
          onClick={attemptSave}
          disabled={!hasChanges || saving}
          className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            hasChanges && !saving
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
          ) : (
            <Save size={16} className="mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        {/* Maintenance Mode */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-6">
              <h3 className="text-lg font-medium text-white mb-1">Maintenance Mode</h3>
              <p className="text-sm text-slate-400">
                When enabled, the platform will be inaccessible to all regular users. Only Super Admins will be able to log in. Active sessions will be terminated.
              </p>
              
              {settings.maintenance_mode && (
                <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center text-rose-400 text-sm">
                  <AlertCircle size={16} className="mr-2" />
                  <strong>Warning:</strong> The platform is currently offline for tenants.
                </div>
              )}
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
            </label>
          </div>
        </div>

        {/* Global Banner */}
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-medium text-white mb-1">Global Announcement Banner</h3>
          <p className="text-sm text-slate-400 mb-4">
            Text displayed at the top of every tenant's dashboard. Useful for announcing upcoming downtime.
          </p>
          
          <textarea
            value={settings.global_banner || ""}
            onChange={(e) => setSettings({ ...settings, global_banner: e.target.value })}
            placeholder="e.g. Scheduled maintenance on Saturday at 2 AM EST."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
            rows={3}
          />
        </div>

        {/* Feature Flags */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-1">Feature Flags</h3>
          <p className="text-sm text-slate-400 mb-6">
            Globally toggle experimental features on or off for all tenants.
          </p>
          
          <div className="space-y-4">
            {Object.keys(settings.feature_flags || {}).map((flag) => (
              <div key={flag} className="flex items-center justify-between bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                <span className="text-slate-300 font-mono text-sm">{flag}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.feature_flags[flag]}
                    onChange={(e) => setSettings({
                      ...settings,
                      feature_flags: {
                        ...settings.feature_flags,
                        [flag]: e.target.checked
                      }
                    })}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmActionModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleSave}
        title="Enable Maintenance Mode"
        description="This will immediately log out all active tenant users and display a maintenance screen. Are you sure you want to proceed?"
        confirmText="Enable Maintenance"
        variant="danger"
        isLoading={saving}
      />
    </div>
  );
}
