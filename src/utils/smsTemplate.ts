
export const replaceTemplateVariables = (template: string, variables: any) => {
    return template.replace(/{(\w+)}/g, (_, key) => {
        return variables[key] || `{${key}}`;
    });
};
