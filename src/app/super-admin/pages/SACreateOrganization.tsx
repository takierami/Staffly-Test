import { useState } from "react";
import { useNavigate } from "react-router";
import { supabaseAdmin } from "../../lib/supabase/supabaseAdmin";

export function SACreateOrganization() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    plan: "trial",
    admin_email: "",
    admin_name: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await supabaseAdmin.createOrganization(formData);
      navigate("/super-admin/organizations");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white mb-4">
          &larr; Back to Organizations
        </button>
        <h2 className="text-3xl font-bold tracking-tight">Create Organization</h2>
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl">
        <p className="text-slate-400 mb-6">This will create a new tenant and invite their first administrator.</p>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Organization Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white" placeholder="Acme Corp" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Organization Slug</label>
            <input required type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white" placeholder="acme" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Subscription Plan</label>
            <select name="plan" value={formData.plan} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white">
              <option value="trial">Trial</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <hr className="border-slate-700 my-6" />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Admin Email</label>
            <input required type="email" name="admin_email" value={formData.admin_email} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white" placeholder="admin@acme.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Admin Full Name</label>
            <input required type="text" name="admin_name" value={formData.admin_name} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white" placeholder="John Doe" />
          </div>
          <div className="pt-4">
            <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors">
              {loading ? "Creating..." : "Create Organization & Invite Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
