<?php

namespace App\Support;

class Totp
{
    public static function generateSecret(int $length = 16): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';

        for ($i = 0; $i < $length; $i++) {
            $secret .= $alphabet[random_int(0, 31)];
        }

        return $secret;
    }

    public static function currentCode(string $secret, ?int $timestamp = null): string
    {
        $slice = (int) floor(($timestamp ?? time()) / 30);

        return self::code($secret, $slice);
    }

    public static function verify(string $secret, string $code, int $window = 1): bool
    {
        $code = preg_replace('/\s+/', '', $code) ?? '';

        if (! preg_match('/^\d{6}$/', $code)) {
            return false;
        }

        $slice = (int) floor(time() / 30);

        for ($offset = -$window; $offset <= $window; $offset++) {
            if (hash_equals(self::code($secret, $slice + $offset), $code)) {
                return true;
            }
        }

        return false;
    }

    private static function code(string $secret, int $slice): string
    {
        $time = pack('N2', ($slice >> 32) & 0xFFFFFFFF, $slice & 0xFFFFFFFF);
        $hash = hash_hmac('sha1', $time, self::base32Decode($secret), true);
        $offset = ord(substr($hash, -1)) & 0x0F;
        $binary = unpack('N', substr($hash, $offset, 4))[1] & 0x7FFFFFFF;

        return str_pad((string) ($binary % 1000000), 6, '0', STR_PAD_LEFT);
    }

    private static function base32Decode(string $secret): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = strtoupper((string) preg_replace('/[^A-Z2-7]/i', '', $secret));
        $buffer = 0;
        $bits = 0;
        $output = '';

        foreach (str_split($secret) as $char) {
            $value = strpos($alphabet, $char);

            if ($value === false) {
                continue;
            }

            $buffer = ($buffer << 5) | $value;
            $bits += 5;

            if ($bits >= 8) {
                $bits -= 8;
                $output .= chr(($buffer >> $bits) & 0xFF);
            }
        }

        return $output;
    }
}
