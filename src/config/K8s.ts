// TerraForm Image to use
export const K8S_TF_IMAGE: string = process.env.K8S_TF_IMAGE || 'hashicorp/terraform';

// TerraForm Image pull policy
export const K8S_TF_IMAGE_PP: string = process.env.K8S_TF_IMAGE_PP || 'IfNotPresent';

// K8s Namespace to use with TerraForm
export const K8S_TF_NS: string = process.env.K8S_TF_NS || 'terraform';
