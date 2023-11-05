export default function InviteUserButton() {
  return (
    <form action='/invite' method='get'>
      <button className='py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover'>
        Invite
      </button>
    </form>
  );
}
