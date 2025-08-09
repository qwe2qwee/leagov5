import ForgetReset from "@/components/Auth/ForgetReset";

const ResetPhone = () => (
  <ForgetReset type="phone" onSuccessRedirect="/(tabs)" />
);

export default ResetPhone;
