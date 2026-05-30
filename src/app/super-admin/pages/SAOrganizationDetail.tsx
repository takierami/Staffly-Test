import { useParams, Link } from "react-router";

export function SAOrganizationDetail() {
  const { id } = useParams();

  return (
    <div>
      <div className="mb-6">
        <Link to="/super-admin/organizations" className="text-slate-400 hover:text-white mb-4 inline-block">
          &larr; Back to Organizations
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Organization Detail</h2>
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <p className="text-slate-400">Loading details for org: {id}...</p>
      </div>
    </div>
  );
}
