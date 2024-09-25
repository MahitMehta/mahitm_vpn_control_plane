import type { IUserRule } from "../routes/node/types";

export const hasNodeAccess = (
	email: string,
	userRules: IUserRule[],
): boolean => {
	if (userRules.length === 0) return true;

	for (const { pattern: rule } of userRules) {
		if (rule.startsWith("@") && email.endsWith(rule)) {
			return true;
		}
		if (email === rule) {
			return true;
		}
	}
	return false;
};
