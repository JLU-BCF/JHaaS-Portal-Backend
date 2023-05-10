// TerraForm Image to use
export const K8S_TF_IMAGE: string = process.env.K8S_TF_IMAGE || 'hashicorp/terraform';

// K8s Namespace to use with TerraForm
export const K8S_TF_NS: string = process.env.K8S_TF_NS || 'terraform';
