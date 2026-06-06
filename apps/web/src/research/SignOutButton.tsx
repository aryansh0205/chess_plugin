import { useEmbedUserContext } from "../embed/EmbedUserProvider";

export function SignOutButton() {
  const { hideBoilerplateAuth } = useEmbedUserContext();

  if (hideBoilerplateAuth) {
    return null;
  }

  return (
    <button
      type="button"
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100"
      onClick={() => {
        console.info("sign out (stub)");
      }}
    >
      Sign out
    </button>
  );
}
