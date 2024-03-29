﻿using AngularAuthAPI.Helpers;
using Backend.Context;
using Backend.NewFolder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using System.Security.Cryptography;
using Backend.Model.Dto;
using Backend.Healper;
using Backend.UtilityServices;


namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AddDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IEmailServices _emailService;
        public UserController(AddDbContext addDbContext, IConfiguration configuration, IEmailServices emailService)
        {
            _dbContext = addDbContext;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] Users userObj)
        {
            if (userObj == null)
            {
                return BadRequest();
            }
            var auth = await _dbContext.Users
                .FirstOrDefaultAsync(x => x.Username == userObj.Username);
            if (auth == null)
            {
                return NotFound(new { Message = "User not found" });
            }
            if (!PasswordHasher.VerifyPassword(userObj.Password, auth.Password))
            {
                return BadRequest(new { Message = "Password is incorrect" });
            }
            auth.Token = CreateJwt(auth);
            var newAccessToken = auth.Token;
            var newRefreshToken = createRefreshToken();
            auth.RefreshToken = newRefreshToken;
            auth.RefreshTokenExpiryTime = DateTime.Now.AddDays(5);
            await _dbContext.SaveChangesAsync();

            return Ok(new TokenApiDto()
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken

            });
        }



        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] Users userObj)
        {
            if (userObj == null)
                return BadRequest();

            if (userObj == null) return BadRequest();

            //Check username

            if (await CheckUserNameExistAsync(userObj.Username))
                return BadRequest(new { Message = "Username Already Exist!" });

            //Check Email

            if (await CheckEmailExistAsync(userObj.Email))
                return BadRequest(new { Message = "Email Already Exist!" });

            //Check password Strength

            var pass = CheckPasswordStrength(userObj.Password);
            if (!string.IsNullOrEmpty(pass))
                return BadRequest(new { Message = pass.ToString() });

            userObj.Password = PasswordHasher.HashPassword(userObj.Password);
            userObj.Role = "User";
            userObj.Token = "";
            await _dbContext.AddAsync(userObj);
            await _dbContext.SaveChangesAsync();
            return Ok(new
            {
                Message = "User Registered!"
            });

        }
        private Task<bool> CheckUserNameExistAsync(string username)
            => _dbContext.Users.AnyAsync(x => x.Username == username);
        private Task<bool> CheckEmailExistAsync(string email)
            => _dbContext.Users.AnyAsync(x => x.Email == email);
        private string CheckPasswordStrength(string password)
        {

            StringBuilder sb = new StringBuilder();

            if (password.Length < 8)
                sb.Append("Minimum password length should be 8" + Environment.NewLine);

            if (!(Regex.IsMatch(password, "[a-z]") && Regex.IsMatch(password, "[A-Z]")
            && Regex.IsMatch(password, "[0-9]")))
                sb.Append("Password should be alphanumeric" + Environment.NewLine);
            if (!Regex.IsMatch(password, "[,~,`,!,@,#,$,%,^,&,*,(,),_,-,+,=,{,},|,\\,:,;,\",',<,>,?,/]"))
                sb.Append("Password should contain special character" + Environment.NewLine);
            return sb.ToString();
        }
        private string CreateJwt(Users users)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("veryverySeceret...");

            var identity = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, users.Role),
                new Claim(ClaimTypes.Name,$"{users.Username}")
            });

            var credential = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = credential
            };
            var token = jwtTokenHandler.CreateToken(tokenDescriptor);
            return jwtTokenHandler.WriteToken(token);
        }

        private string createRefreshToken()
        {
            var TokenByte = RandomNumberGenerator.GetBytes(64);
            var refreshToken = Convert.ToBase64String(TokenByte);

            var tokenInUser = _dbContext.Users
                .Any(a => a.RefreshToken == refreshToken);
            if (tokenInUser)
            {
                return createRefreshToken();
            }
            return refreshToken;
        }

        private ClaimsPrincipal GetPrincipleFromExpiredToken(string token)

        {
            var key = Encoding.ASCII.GetBytes("veryverysceret.....");
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken; var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("This is Invalid Token");
            return principal;

        }

        [Authorize]
        [HttpGet]

        public async Task<ActionResult<Users>> GetAllUsers()
        {
            return Ok(await _dbContext.Users.ToListAsync());
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(TokenApiDto tokenApiDto)
        {
            if (tokenApiDto is null)

                return BadRequest("Invalid Client Request");
            string accessToken = tokenApiDto.AccessToken;
            string refreshToken = tokenApiDto.RefreshToken;
            var principal = GetPrincipleFromExpiredToken(accessToken);
            var username = principal.Identity.Name;
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user is null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.Now)
                return BadRequest("Invalid Request");

            var newAccessToken = CreateJwt(user);
            var newRefreshToken = createRefreshToken();

            user.RefreshToken = newRefreshToken;

            await _dbContext.SaveChangesAsync();
            return Ok(new TokenApiDto()
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
            });
        }

        [HttpPost("send-reset-email/{email}")]
        public async Task<IActionResult> SendEmail(string email)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(a => a.Email == email);
            if (user is null)
            {
                return NotFound(new
                {
                    StatusCode = 404,
                    Message = "email Doesn't Exist"
                });
            }
            var tokenBytes = RandomNumberGenerator.GetBytes(64);
            var emailToken = Convert.ToBase64String(tokenBytes);
            user.ResetPasswordToken = emailToken;
            user.ResetPasswordExpiry = DateTime.Now.AddMinutes(15);
            string from = _configuration["EmailSettings:From"];
            var emailModel = new EmailModel(email, "Reset Password!!", EmailBody.EmailStringBody(email, emailToken));
            _emailService.SendEmail(emailModel);
            _dbContext.Entry(user).State = EntityState.Modified;
            await _dbContext.SaveChangesAsync();
            return Ok(new {
                StatusCode = 200,
                Message = "Email Sent!"
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
        {
            var newToken = resetPasswordDto.EmailToken.Replace(" ", "+");
            var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(a => a.Email == resetPasswordDto.Email);
            if (user is null)
            {
                return NotFound(new {
                    StatusCode = 404,
                    Message = "User Doesn't Exist"
                });
            }
                var tokenCode = user.ResetPasswordToken;
                DateTime emailTokenExpiry = user.ResetPasswordExpiry;
            if (tokenCode != resetPasswordDto.EmailToken || emailTokenExpiry < DateTime.Now)
            {
                return BadRequest(new {
                    StatusCode = 400,
                    Message = "Invalid Reset Link"
                });
            }
                    user.Password = PasswordHasher.HashPassword(resetPasswordDto.NewPassword);
                    _dbContext.Entry(user).State = EntityState.Modified;
                    await _dbContext.SaveChangesAsync();
                    return Ok(new {
                        StatusCode = 200,
                        Message = "Password Reset Successfully"
                    });
                }

}
}
    