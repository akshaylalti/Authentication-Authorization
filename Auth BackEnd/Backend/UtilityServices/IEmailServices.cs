using Backend.Model.Dto;

namespace Backend.UtilityServices
{
    public interface IEmailServices
    {
        void SendEmail(EmailModel emailModel);
    }
}
