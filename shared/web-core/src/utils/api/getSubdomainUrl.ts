import getProtocol from "./getProtocol";

export default function getSubdomainUrl(projectSlug: string){
    const protocol = getProtocol();
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';

    return `${protocol}://${projectSlug}.${hostname}${port}`;
}