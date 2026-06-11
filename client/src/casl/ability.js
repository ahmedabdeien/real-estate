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
    const [subject, action] = perm.split('.');
    if (subject && action) can(action, subject);
  });

  return build();
}
