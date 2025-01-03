import { defineAbilityFor } from "../auth";
import { userSchema } from "../auth/models/user";

export function getUserPermissions(userId: string, roleName: string) {

 const authUser = userSchema.parse({
     id: userId,
     role: roleName,
 })

 const ability = defineAbilityFor(authUser)

 return ability

}