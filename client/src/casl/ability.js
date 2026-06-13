import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export function buildAbility(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (!user) return build();

  if (user.isSuperAdmin) {
    can('manage', 'all');
    return build();
  }

  const permissions = user?.role?.permissions || [];

  permissions.forEach(perm => {
    const parts = perm.split('.');
    if (parts.length === 3) {
      // platform.companies.view → can('view', 'platform.companies')
      can(parts[2], `${parts[0]}.${parts[1]}`);
    } else if (parts.length === 2) {
      can(parts[1], parts[0]);
    }
  });

  return build();
}
