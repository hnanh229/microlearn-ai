# 🔒 Admin Panel Security Configuration

## Overview
The admin panel files have been removed from the public repository for security reasons. This prevents unauthorized access to admin functionality and protects sensitive administrative code.

## Files Excluded from Repository

### Frontend Admin Files
- `frontend/src/pages/admin/` - All admin page components
- `frontend/src/components/admin/` - Admin layout and components  
- `frontend/src/services/adminService.js` - Admin API service

### Backend Admin Files
- `backend/src/routes/adminRoutes.js` - Admin API routes
- `backend/src/controllers/adminController.js` - Admin business logic
- `backend/src/middleware/adminAuth.js` - Admin authentication middleware
- `backend/src/scripts/initAdmin.js` - Admin user initialization script

## Security Benefits
✅ Admin functionality is not exposed in public repository  
✅ Prevents unauthorized code analysis of admin features  
✅ Protects admin authentication mechanisms  
✅ Reduces attack surface for potential security vulnerabilities  

## For Developers
If you need to work with admin functionality:

1. **Contact the project maintainer** for access to admin files
2. **Keep admin files in a private repository** or secure location
3. **Never commit admin files** to public repositories
4. **Use environment variables** for admin credentials
5. **Deploy admin files separately** from main application

## Admin Panel Access
- Local Development: `http://localhost:5173/admin/login`
- Production: `https://hnanh229.github.io/microlearn-ai/admin/login`

## Note
The admin panel still exists and functions normally in your local development environment. Only the source code has been excluded from the public repository.

---
**Important**: Keep this security configuration in place to maintain the integrity and security of your admin panel.
