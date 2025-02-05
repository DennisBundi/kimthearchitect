// Under ADMIN section
<div className="admin-section">
  <div className="label">ADMIN </div>
  
  <NavLink 
    to="/admin"
    className={({ isActive }) => isActive ? "active-nav-link" : ""}
  >
    <ClockIcon /> Dashboard
  </NavLink>
  
  <NavLink to="/admin/manage-projects">
    <FolderIcon /> Manage Projects
  </NavLink>
  
  <NavLink to="/admin/invoices">
    <DocumentTextIcon /> Invoices
  </NavLink>
  
  <NavLink to="/admin/quotations">
    <DocumentDuplicateIcon /> Quotations
  </NavLink>
  
  <NavLink to="/admin/manage-users">
    <UsersIcon /> Manage Users
  </NavLink>
  
  <NavLink to="/admin/settings">
    <CogIcon /> Settings
  </NavLink>
</div> 